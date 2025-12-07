// Cart Types for E-Commerce Platform

export interface ICart {
  _id?: string;
  userId: string;
  sessionId?: string;
  items: ICartItem[];
  coupon?: IAppliedCoupon;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICartItem {
  _id?: string;
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  maxQuantity: number;
  subtotal: number;
}

export interface IAppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
}

export interface ICoupon {
  _id?: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface IUpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

export interface ICartSummary {
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
}

// WebSocket Events for Real-time Cart
export enum CartSocketEvents {
  JOIN_CART = 'cart:join',
  LEAVE_CART = 'cart:leave',
  CART_UPDATED = 'cart:updated',
  ITEM_ADDED = 'cart:item_added',
  ITEM_REMOVED = 'cart:item_removed',
  ITEM_UPDATED = 'cart:item_updated',
  PRICE_CHANGED = 'cart:price_changed',
  STOCK_WARNING = 'cart:stock_warning',
  COUPON_APPLIED = 'cart:coupon_applied',
  COUPON_REMOVED = 'cart:coupon_removed',
}
