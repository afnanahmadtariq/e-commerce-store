import { Router, Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services';
import { validate } from '../middleware';
import { createCategorySchema, updateCategorySchema } from '../validators';

const router = Router();

/**
 * @route GET /categories
 * @desc Get all categories
 * @access Public
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories = await CategoryService.getAll(includeInactive);
      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /categories/tree
 * @desc Get category tree (hierarchical)
 * @access Public
 */
router.get(
  '/tree',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tree = await CategoryService.getCategoryTree();
      res.json({
        success: true,
        data: { categories: tree },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /categories/slug/:slug
 * @desc Get category by slug
 * @access Public
 */
router.get(
  '/slug/:slug',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await CategoryService.getBySlug(req.params.slug);
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found',
        });
        return;
      }
      res.json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /categories/:id
 * @desc Get category by ID
 * @access Public
 */
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await CategoryService.getById(req.params.id);
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found',
        });
        return;
      }
      res.json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /categories/:id/subcategories
 * @desc Get subcategories
 * @access Public
 */
router.get(
  '/:id/subcategories',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subcategories = await CategoryService.getSubcategories(req.params.id);
      res.json({
        success: true,
        data: { subcategories },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /categories
 * @desc Create new category (admin)
 * @access Private/Admin
 */
router.post(
  '/',
  validate(createCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await CategoryService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PUT /categories/:id
 * @desc Update category (admin)
 * @access Private/Admin
 */
router.put(
  '/:id',
  validate(updateCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await CategoryService.update(req.params.id, req.body);
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found',
        });
        return;
      }
      res.json({
        success: true,
        message: 'Category updated successfully',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /categories/:id
 * @desc Delete category (admin)
 * @access Private/Admin
 */
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await CategoryService.delete(req.params.id);
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found',
        });
        return;
      }
      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PUT /categories/reorder
 * @desc Reorder categories (admin)
 * @access Private/Admin
 */
router.put(
  '/reorder',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        res.status(400).json({
          success: false,
          message: 'orderedIds must be an array',
        });
        return;
      }
      
      await CategoryService.reorder(orderedIds);
      res.json({
        success: true,
        message: 'Categories reordered successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
