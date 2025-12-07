import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required().messages({
    'string.min': 'Product name must be at least 2 characters',
    'string.max': 'Product name cannot exceed 200 characters',
    'any.required': 'Product name is required',
  }),
  description: Joi.string().required().messages({
    'any.required': 'Product description is required',
  }),
  shortDescription: Joi.string().max(500).optional(),
  sku: Joi.string().trim().uppercase().required().messages({
    'any.required': 'SKU is required',
  }),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price cannot be negative',
    'any.required': 'Price is required',
  }),
  compareAtPrice: Joi.number().min(0).optional(),
  costPrice: Joi.number().min(0).optional(),
  category: Joi.string().required().messages({
    'any.required': 'Category is required',
  }),
  subcategory: Joi.string().optional(),
  brand: Joi.string().optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  images: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      alt: Joi.string().optional(),
      isPrimary: Joi.boolean().default(false),
      order: Joi.number().default(0),
    })
  ).optional(),
  variants: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      sku: Joi.string().required(),
      price: Joi.number().min(0).required(),
      inventory: Joi.number().min(0).default(0),
      attributes: Joi.object().pattern(Joi.string(), Joi.string()),
    })
  ).optional(),
  inventory: Joi.object({
    quantity: Joi.number().min(0).default(0),
    reservedQuantity: Joi.number().min(0).default(0),
    lowStockThreshold: Joi.number().min(0).default(10),
    trackInventory: Joi.boolean().default(true),
    allowBackorder: Joi.boolean().default(false),
  }).optional(),
  specifications: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  isFeatured: Joi.boolean().default(false),
  vendorId: Joi.string().optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().optional(),
  shortDescription: Joi.string().max(500).optional(),
  sku: Joi.string().trim().uppercase().optional(),
  price: Joi.number().min(0).optional(),
  compareAtPrice: Joi.number().min(0).optional().allow(null),
  costPrice: Joi.number().min(0).optional().allow(null),
  category: Joi.string().optional(),
  subcategory: Joi.string().optional().allow(null),
  brand: Joi.string().optional().allow(null),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  images: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      alt: Joi.string().optional(),
      isPrimary: Joi.boolean().default(false),
      order: Joi.number().default(0),
    })
  ).optional(),
  variants: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      sku: Joi.string().required(),
      price: Joi.number().min(0).required(),
      inventory: Joi.number().min(0).default(0),
      attributes: Joi.object().pattern(Joi.string(), Joi.string()),
    })
  ).optional(),
  inventory: Joi.object({
    quantity: Joi.number().min(0),
    reservedQuantity: Joi.number().min(0),
    lowStockThreshold: Joi.number().min(0),
    trackInventory: Joi.boolean(),
    allowBackorder: Joi.boolean(),
  }).optional(),
  specifications: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  isFeatured: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

export const productFilterSchema = Joi.object({
  category: Joi.string().optional().allow(''),
  subcategory: Joi.string().optional().allow(''),
  brand: Joi.string().optional().allow(''),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  search: Joi.string().optional().allow(''),
  sortBy: Joi.string().valid('price', 'name', 'createdAt', 'ratings').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  inStock: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
});

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  parentId: Joi.string().optional(),
  image: Joi.string().uri().optional(),
  icon: Joi.string().optional(),
  order: Joi.number().min(0).default(0),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().max(500).optional().allow(null),
  parentId: Joi.string().optional().allow(null),
  image: Joi.string().uri().optional().allow(null),
  icon: Joi.string().optional().allow(null),
  order: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const createReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
    'any.required': 'Rating is required',
  }),
  title: Joi.string().max(200).optional(),
  content: Joi.string().max(2000).required().messages({
    'string.max': 'Review cannot exceed 2000 characters',
    'any.required': 'Review content is required',
  }),
  images: Joi.array().items(Joi.string().uri()).max(5).optional(),
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional(),
  title: Joi.string().max(200).optional(),
  content: Joi.string().max(2000).optional(),
  images: Joi.array().items(Joi.string().uri()).max(5).optional(),
});

export const inventoryUpdateSchema = Joi.object({
  quantity: Joi.number().min(0).required(),
  operation: Joi.string().valid('set', 'increment', 'decrement').default('set'),
});
