import { Server as SocketServer } from 'socket.io';
import { Cart, ICartDocument } from '../models/cart.model';
import { Coupon } from '../models/coupon.model';

const TAX_RATE = 0.08; // 8% tax
const FREE_SHIPPING_THRESHOLD = 50; // Free shipping over $50
const FLAT_SHIPPING_RATE = 5.99;

export interface AddToCartData {
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  maxQuantity: number;
}

export interface CartIdentifier {
  userId?: string;
  sessionId?: string;
}

// Socket.IO instance for real-time updates
let io: SocketServer | null = null;

export class CartService {
  // Initialize Socket.IO
  static setSocketServer(socketServer: SocketServer) {
    io = socketServer;
  }

  // Emit cart update to connected clients
  private static emitCartUpdate(cartId: string, event: string, data: unknown) {
    if (io) {
      io.to(`cart:${cartId}`).emit(event, data);
    }
  }

  // Get or create cart
  static async getOrCreateCart(identifier: CartIdentifier): Promise<ICartDocument> {
    const { userId, sessionId } = identifier;

    let cart = await Cart.findOne({
      $or: [
        { userId: userId || undefined },
        { sessionId: sessionId || undefined },
      ].filter((q) => Object.values(q)[0] !== undefined),
    });

    if (!cart) {
      cart = await Cart.create({
        userId,
        sessionId,
        items: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      });
    }

    return cart;
  }

  // Get cart
  static async getCart(identifier: CartIdentifier): Promise<ICartDocument | null> {
    const { userId, sessionId } = identifier;

    return Cart.findOne({
      $or: [
        { userId: userId || undefined },
        { sessionId: sessionId || undefined },
      ].filter((q) => Object.values(q)[0] !== undefined),
    });
  }

  // Add item to cart
  static async addItem(
    identifier: CartIdentifier,
    itemData: AddToCartData
  ): Promise<ICartDocument> {
    const cart = await this.getOrCreateCart(identifier);

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === itemData.productId &&
        item.variantId === itemData.variantId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + itemData.quantity;

      if (newQuantity > itemData.maxQuantity) {
        throw new Error(`Only ${itemData.maxQuantity} items available in stock`);
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].price * newQuantity;
      cart.items[existingItemIndex].maxQuantity = itemData.maxQuantity;
    } else {
      // Add new item
      if (itemData.quantity > itemData.maxQuantity) {
        throw new Error(`Only ${itemData.maxQuantity} items available in stock`);
      }

      cart.items.push({
        productId: itemData.productId as unknown as ICartDocument['items'][0]['productId'],
        variantId: itemData.variantId,
        name: itemData.name,
        slug: itemData.slug,
        image: itemData.image,
        price: itemData.price,
        originalPrice: itemData.originalPrice || itemData.price,
        quantity: itemData.quantity,
        maxQuantity: itemData.maxQuantity,
        subtotal: itemData.price * itemData.quantity,
      });
    }

    await this.recalculateCart(cart);
    await cart.save();

    // Emit real-time update
    this.emitCartUpdate(cart._id.toString(), 'cart:item_added', {
      cart: this.formatCart(cart),
      addedItem: itemData,
    });

    return cart;
  }

  // Update item quantity
  static async updateItemQuantity(
    identifier: CartIdentifier,
    itemId: string,
    quantity: number
  ): Promise<ICartDocument | null> {
    const cart = await this.getCart(identifier);
    if (!cart) return null;

    const itemIndex = cart.items.findIndex(
      (item) => item._id?.toString() === itemId
    );

    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
      this.emitCartUpdate(cart._id.toString(), 'cart:item_removed', {
        itemId,
      });
    } else {
      if (quantity > cart.items[itemIndex].maxQuantity) {
        throw new Error(`Only ${cart.items[itemIndex].maxQuantity} items available in stock`);
      }

      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].subtotal = cart.items[itemIndex].price * quantity;

      this.emitCartUpdate(cart._id.toString(), 'cart:item_updated', {
        itemId,
        quantity,
        subtotal: cart.items[itemIndex].subtotal,
      });
    }

    await this.recalculateCart(cart);
    await cart.save();

    this.emitCartUpdate(cart._id.toString(), 'cart:updated', {
      cart: this.formatCart(cart),
    });

    return cart;
  }

  // Remove item from cart
  static async removeItem(
    identifier: CartIdentifier,
    itemId: string
  ): Promise<ICartDocument | null> {
    return this.updateItemQuantity(identifier, itemId, 0);
  }

  // Clear cart
  static async clearCart(identifier: CartIdentifier): Promise<ICartDocument | null> {
    const cart = await this.getCart(identifier);
    if (!cart) return null;

    cart.items = [];
    cart.coupon = undefined;
    await this.recalculateCart(cart);
    await cart.save();

    this.emitCartUpdate(cart._id.toString(), 'cart:cleared', {
      cart: this.formatCart(cart),
    });

    return cart;
  }

  // Apply coupon
  static async applyCoupon(
    identifier: CartIdentifier,
    couponCode: string
  ): Promise<ICartDocument> {
    const cart = await this.getCart(identifier);
    if (!cart) {
      throw new Error('Cart not found');
    }

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (!coupon) {
      throw new Error('Invalid or expired coupon code');
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new Error('Coupon usage limit reached');
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && cart.subtotal < coupon.minOrderAmount) {
      throw new Error(`Minimum order amount of $${coupon.minOrderAmount} required`);
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cart.subtotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    // Apply max discount limit
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }

    // Don't let discount exceed subtotal
    if (discountAmount > cart.subtotal) {
      discountAmount = cart.subtotal;
    }

    cart.coupon = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discountAmount * 100) / 100,
    };

    await this.recalculateCart(cart);
    await cart.save();

    this.emitCartUpdate(cart._id.toString(), 'cart:coupon_applied', {
      cart: this.formatCart(cart),
      coupon: cart.coupon,
    });

    return cart;
  }

  // Remove coupon
  static async removeCoupon(identifier: CartIdentifier): Promise<ICartDocument | null> {
    const cart = await this.getCart(identifier);
    if (!cart) return null;

    cart.coupon = undefined;
    await this.recalculateCart(cart);
    await cart.save();

    this.emitCartUpdate(cart._id.toString(), 'cart:coupon_removed', {
      cart: this.formatCart(cart),
    });

    return cart;
  }

  // Recalculate cart totals
  private static async recalculateCart(cart: ICartDocument): Promise<void> {
    // Calculate subtotal
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    cart.subtotal = Math.round(cart.subtotal * 100) / 100;

    // Calculate discount
    if (cart.coupon) {
      if (cart.coupon.discountType === 'percentage') {
        cart.discount = (cart.subtotal * cart.coupon.discountValue) / 100;
      } else {
        cart.discount = cart.coupon.discountValue;
      }

      // Validate and update coupon
      const coupon = await Coupon.findOne({ code: cart.coupon.code, isActive: true });
      if (!coupon || (coupon.minOrderAmount && cart.subtotal < coupon.minOrderAmount)) {
        cart.coupon = undefined;
        cart.discount = 0;
      }
    } else {
      cart.discount = 0;
    }

    cart.discount = Math.min(cart.discount, cart.subtotal);
    cart.discount = Math.round(cart.discount * 100) / 100;

    // Calculate shipping
    const afterDiscount = cart.subtotal - cart.discount;
    cart.shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;

    // Calculate tax
    cart.tax = Math.round((afterDiscount * TAX_RATE) * 100) / 100;

    // Calculate total
    cart.total = Math.round((afterDiscount + cart.tax + cart.shipping) * 100) / 100;
  }

  // Format cart for response
  private static formatCart(cart: ICartDocument) {
    return {
      id: cart._id,
      items: cart.items,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      coupon: cart.coupon,
      subtotal: cart.subtotal,
      discount: cart.discount,
      tax: cart.tax,
      shipping: cart.shipping,
      total: cart.total,
      currency: cart.currency,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - (cart.subtotal - cart.discount)),
    };
  }

  // Get cart summary
  static async getCartSummary(identifier: CartIdentifier) {
    const cart = await this.getCart(identifier);
    if (!cart) {
      return {
        itemCount: 0,
        subtotal: 0,
        discount: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      };
    }

    return {
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cart.subtotal,
      discount: cart.discount,
      tax: cart.tax,
      shipping: cart.shipping,
      total: cart.total,
    };
  }

  // Merge guest cart with user cart after login
  static async mergeCarts(
    sessionId: string,
    userId: string
  ): Promise<ICartDocument | null> {
    const guestCart = await Cart.findOne({ sessionId });
    const userCart = await Cart.findOne({ userId });

    if (!guestCart && !userCart) return null;

    if (!guestCart && userCart) return userCart;

    if (guestCart && !userCart) {
      // Convert guest cart to user cart
      guestCart.userId = userId as unknown as ICartDocument['userId'];
      guestCart.sessionId = undefined;
      await guestCart.save();
      return guestCart;
    }

    // Merge both carts
    if (guestCart && userCart) {
      for (const guestItem of guestCart.items) {
        const existingItemIndex = userCart.items.findIndex(
          (item) =>
            item.productId.toString() === guestItem.productId.toString() &&
            item.variantId === guestItem.variantId
        );

        if (existingItemIndex > -1) {
          // Add quantities (respect max)
          const newQuantity = Math.min(
            userCart.items[existingItemIndex].quantity + guestItem.quantity,
            guestItem.maxQuantity
          );
          userCart.items[existingItemIndex].quantity = newQuantity;
          userCart.items[existingItemIndex].subtotal =
            userCart.items[existingItemIndex].price * newQuantity;
        } else {
          // Add item to user cart
          userCart.items.push(guestItem);
        }
      }

      await this.recalculateCart(userCart);
      await userCart.save();

      // Delete guest cart
      await Cart.findByIdAndDelete(guestCart._id);

      return userCart;
    }

    return null;
  }

  // Update prices in cart (called when product prices change)
  static async updateCartPrices(
    productId: string,
    newPrice: number
  ): Promise<void> {
    const carts = await Cart.find({
      'items.productId': productId,
    });

    for (const cart of carts) {
      let priceChanged = false;

      for (const item of cart.items) {
        if (item.productId.toString() === productId && item.price !== newPrice) {
          item.originalPrice = item.price;
          item.price = newPrice;
          item.subtotal = newPrice * item.quantity;
          priceChanged = true;
        }
      }

      if (priceChanged) {
        await this.recalculateCart(cart);
        await cart.save();

        this.emitCartUpdate(cart._id.toString(), 'cart:price_changed', {
          cart: this.formatCart(cart),
          productId,
          newPrice,
        });
      }
    }
  }

  // Delete cart
  static async deleteCart(identifier: CartIdentifier): Promise<boolean> {
    const { userId, sessionId } = identifier;

    const result = await Cart.findOneAndDelete({
      $or: [
        { userId: userId || undefined },
        { sessionId: sessionId || undefined },
      ].filter((q) => Object.values(q)[0] !== undefined),
    });

    return !!result;
  }
}
