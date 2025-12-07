import { Router, Request, Response, NextFunction } from 'express';
import { CartService } from '../services';

const router = Router();

// Helper to get cart identifier from request
const getCartIdentifier = (req: Request) => ({
  userId: req.headers['x-user-id'] as string | undefined,
  sessionId: req.headers['x-session-id'] as string || req.sessionID,
});

/**
 * @route GET /cart
 * @desc Get current cart
 * @access Public
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getCartIdentifier(req);
      const cart = await CartService.getCart(identifier);

      res.json({
        success: true,
        data: {
          cart: cart || {
            items: [],
            subtotal: 0,
            discount: 0,
            tax: 0,
            shipping: 0,
            total: 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /cart/summary
 * @desc Get cart summary
 * @access Public
 */
router.get(
  '/summary',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getCartIdentifier(req);
      const summary = await CartService.getCartSummary(identifier);

      res.json({
        success: true,
        data: { summary },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /cart/items
 * @desc Add item to cart
 * @access Public
 */
router.post(
  '/items',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getCartIdentifier(req);
      const { productId, variantId, name, slug, image, price, originalPrice, quantity, maxQuantity } = req.body;

      if (!productId || !name || !slug || !image || price === undefined || quantity === undefined) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: productId, name, slug, image, price, quantity',
        });
        return;
      }

      const cart = await CartService.addItem(identifier, {
        productId,
        variantId,
        name,
        slug,
        image,
        price,
        originalPrice,
        quantity,
        maxQuantity: maxQuantity || 999,
      });

      res.status(201).json({
        success: true,
        message: 'Item added to cart',
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PUT /cart/items/:itemId
 * @desc Update cart item quantity
 * @access Public
 */
router.put(
  '/items/:itemId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getCartIdentifier(req);
      const { quantity } = req.body;

      if (quantity === undefined) {
        res.status(400).json({
          success: false,
          message: 'Quantity is required',
        });
        return;
      }

      const cart = await CartService.updateItemQuantity(
        identifier,
        req.params.itemId,
        quantity
      );

      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
        return;
      }

      res.json({
        success: true,
        message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /cart/items/:itemId
 * @desc Remove item from cart
 * @access Public
 */
router.delete(
  '/items/:itemId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getCartIdentifier(req);
      const cart = await CartService.removeItem(identifier, req.params.itemId);

      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Item removed from cart',
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /cart/clear
 * @desc Clear cart
 * @access Public
 */
router.delete(
  '/clear',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getCartIdentifier(req);
      const cart = await CartService.clearCart(identifier);

      res.json({
        success: true,
        message: 'Cart cleared',
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /cart/coupon
 * @desc Apply coupon to cart
 * @access Public
 */
router.post(
  '/coupon',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getCartIdentifier(req);
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Coupon code is required',
        });
        return;
      }

      const cart = await CartService.applyCoupon(identifier, code);

      res.json({
        success: true,
        message: 'Coupon applied successfully',
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /cart/coupon
 * @desc Remove coupon from cart
 * @access Public
 */
router.delete(
  '/coupon',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getCartIdentifier(req);
      const cart = await CartService.removeCoupon(identifier);

      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Coupon removed',
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /cart/merge
 * @desc Merge guest cart with user cart
 * @access Private
 */
router.post(
  '/merge',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      const userId = req.headers['x-user-id'] as string;

      if (!sessionId || !userId) {
        res.status(400).json({
          success: false,
          message: 'Both sessionId and userId are required',
        });
        return;
      }

      const cart = await CartService.mergeCarts(sessionId, userId);

      res.json({
        success: true,
        message: 'Carts merged successfully',
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
