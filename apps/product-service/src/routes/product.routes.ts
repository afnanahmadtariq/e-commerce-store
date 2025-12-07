import { Router, Request, Response, NextFunction } from 'express';
import { ProductService, CategoryService, ReviewService } from '../services';
import { validate, validateQuery } from '../middleware';
import { 
  createProductSchema, 
  updateProductSchema, 
  productFilterSchema,
  createCategorySchema,
  updateCategorySchema,
  createReviewSchema,
  updateReviewSchema,
  inventoryUpdateSchema,
} from '../validators';

const router = Router();

// ==================== PRODUCTS ====================

/**
 * @route GET /products
 * @desc Get all products with filtering
 * @access Public
 */
router.get(
  '/',
  validateQuery(productFilterSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ProductService.getAll(req.query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /products/featured
 * @desc Get featured products
 * @access Public
 */
router.get(
  '/featured',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const products = await ProductService.getFeatured(limit);
      res.json({
        success: true,
        data: { products },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /products/search
 * @desc Search products
 * @access Public
 */
router.get(
  '/search',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, limit } = req.query;
      if (!q) {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
        return;
      }

      const products = await ProductService.search(
        q as string, 
        parseInt(limit as string) || 20
      );
      res.json({
        success: true,
        data: { products },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /products/low-stock
 * @desc Get low stock products (admin)
 * @access Private/Admin
 */
router.get(
  '/low-stock',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await ProductService.getLowStock();
      res.json({
        success: true,
        data: { products },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /products/by-category
 * @desc Get product count by category
 * @access Public
 */
router.get(
  '/by-category',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await ProductService.getProductsByCategory();
      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /products/slug/:slug
 * @desc Get product by slug
 * @access Public
 */
router.get(
  '/slug/:slug',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await ProductService.getBySlug(req.params.slug);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }
      res.json({
        success: true,
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /products/:id
 * @desc Get product by ID
 * @access Public
 */
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await ProductService.getById(req.params.id);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }
      res.json({
        success: true,
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /products/:id/related
 * @desc Get related products
 * @access Public
 */
router.get(
  '/:id/related',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const products = await ProductService.getRelated(req.params.id, limit);
      res.json({
        success: true,
        data: { products },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /products
 * @desc Create new product (admin)
 * @access Private/Admin
 */
router.post(
  '/',
  validate(createProductSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await ProductService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PUT /products/:id
 * @desc Update product (admin)
 * @access Private/Admin
 */
router.put(
  '/:id',
  validate(updateProductSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await ProductService.update(req.params.id, req.body);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /products/:id
 * @desc Delete product (soft delete, admin)
 * @access Private/Admin
 */
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await ProductService.delete(req.params.id);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }
      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PUT /products/:id/inventory
 * @desc Update product inventory
 * @access Private/Admin
 */
router.put(
  '/:id/inventory',
  validate(inventoryUpdateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quantity, operation } = req.body;
      const product = await ProductService.updateInventory(
        req.params.id, 
        quantity, 
        operation
      );
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }
      res.json({
        success: true,
        message: 'Inventory updated successfully',
        data: { inventory: product.inventory },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==================== REVIEWS ====================

/**
 * @route GET /products/:id/reviews
 * @desc Get product reviews
 * @access Public
 */
router.get(
  '/:id/reviews',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as 'createdAt' | 'rating' | 'helpfulCount') || 'createdAt';

      const result = await ReviewService.getByProduct(
        req.params.id, 
        page, 
        limit, 
        sortBy
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /products/:id/reviews
 * @desc Create product review
 * @access Private
 */
router.post(
  '/:id/reviews',
  validate(createReviewSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // In production, get userId and userName from authenticated user
      const userId = req.headers['x-user-id'] as string || 'temp-user';
      const userName = req.headers['x-user-name'] as string || 'Anonymous';

      const review = await ReviewService.create({
        productId: req.params.id,
        userId,
        userName,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PUT /products/:productId/reviews/:reviewId
 * @desc Update review
 * @access Private
 */
router.put(
  '/:productId/reviews/:reviewId',
  validate(updateReviewSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      
      const review = await ReviewService.update(
        req.params.reviewId,
        userId,
        req.body
      );

      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Review not found or unauthorized',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Review updated successfully',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /products/:productId/reviews/:reviewId
 * @desc Delete review
 * @access Private
 */
router.delete(
  '/:productId/reviews/:reviewId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      
      const deleted = await ReviewService.delete(req.params.reviewId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Review not found or unauthorized',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /products/:productId/reviews/:reviewId/helpful
 * @desc Mark review as helpful
 * @access Public
 */
router.post(
  '/:productId/reviews/:reviewId/helpful',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const review = await ReviewService.markHelpful(req.params.reviewId);

      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Review not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Review marked as helpful',
        data: { helpfulCount: review.helpfulCount },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
