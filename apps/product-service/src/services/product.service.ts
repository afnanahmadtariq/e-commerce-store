import { Product, IProductDocument } from '../models/product.model';
import { Category } from '../models/category.model';
import { Review } from '../models/review.model';

export interface ProductFilter {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price' | 'name' | 'createdAt' | 'ratings';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface CreateProductData {
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  tags?: string[];
  images?: IProductDocument['images'];
  variants?: IProductDocument['variants'];
  inventory?: Partial<IProductDocument['inventory']>;
  specifications?: Record<string, string>;
  isFeatured?: boolean;
  vendorId?: string;
}

export class ProductService {
  // Create product
  static async create(data: CreateProductData): Promise<IProductDocument> {
    // Generate slug from name
    const baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = await Product.create({
      ...data,
      slug,
    });

    // Update category product count
    await Category.findOneAndUpdate(
      { slug: data.category },
      { $inc: { productCount: 1 } }
    );

    return product;
  }

  // Get all products with filtering and pagination
  static async getAll(filters: ProductFilter = {}) {
    const {
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      inStock,
      isFeatured,
      isActive = true,
    } = filters;

    const query: Record<string, unknown> = { isActive };

    // Case-insensitive category/subcategory/brand matching to support both slugs and display names
    if (category) query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    if (subcategory) query.subcategory = { $regex: new RegExp(`^${subcategory}$`, 'i') };
    if (brand) query.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    if (typeof isFeatured === 'boolean') query.isFeatured = isFeatured;

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) (query.price as Record<string, number>).$gte = minPrice;
      if (maxPrice !== undefined) (query.price as Record<string, number>).$lte = maxPrice;
    }

    if (inStock) {
      query['inventory.quantity'] = { $gt: 0 };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions: Record<string, 1 | -1> = {};
    switch (sortBy) {
      case 'price':
        sortOptions.price = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'name':
        sortOptions.name = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'ratings':
        sortOptions['ratings.average'] = sortOrder === 'asc' ? 1 : -1;
        break;
      default:
        sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get product by ID
  static async getById(id: string): Promise<IProductDocument | null> {
    return Product.findById(id);
  }

  // Get product by slug
  static async getBySlug(slug: string): Promise<IProductDocument | null> {
    return Product.findOne({ slug, isActive: true });
  }

  // Update product
  static async update(
    id: string, 
    updates: Partial<CreateProductData>
  ): Promise<IProductDocument | null> {
    // If name is being updated, regenerate slug
    if (updates.name) {
      const baseSlug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      let slug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      (updates as Record<string, unknown>).slug = slug;
    }

    return Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
  }

  // Delete product (soft delete)
  static async delete(id: string): Promise<IProductDocument | null> {
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (product) {
      // Update category product count
      await Category.findOneAndUpdate(
        { slug: product.category },
        { $inc: { productCount: -1 } }
      );
    }

    return product;
  }

  // Hard delete product
  static async hardDelete(id: string): Promise<boolean> {
    const product = await Product.findById(id);
    if (!product) return false;

    await Product.findByIdAndDelete(id);
    
    // Update category product count
    await Category.findOneAndUpdate(
      { slug: product.category },
      { $inc: { productCount: -1 } }
    );

    // Delete all reviews for this product
    await Review.deleteMany({ productId: id });

    return true;
  }

  // Get featured products
  static async getFeatured(limit = 10): Promise<IProductDocument[]> {
    return Product.find({ isActive: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Search products
  static async search(searchTerm: string, limit = 20): Promise<IProductDocument[]> {
    return Product.find(
      { 
        isActive: true,
        $text: { $search: searchTerm } 
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit);
  }

  // Update inventory
  static async updateInventory(
    productId: string,
    quantity: number,
    operation: 'set' | 'increment' | 'decrement' = 'set'
  ): Promise<IProductDocument | null> {
    const update: Record<string, unknown> = {};

    switch (operation) {
      case 'increment':
        update.$inc = { 'inventory.quantity': quantity };
        break;
      case 'decrement':
        update.$inc = { 'inventory.quantity': -quantity };
        break;
      default:
        update.$set = { 'inventory.quantity': quantity };
    }

    return Product.findByIdAndUpdate(
      productId,
      update,
      { new: true }
    );
  }

  // Reserve inventory
  static async reserveInventory(
    productId: string, 
    quantity: number
  ): Promise<boolean> {
    const product = await Product.findById(productId);
    if (!product) return false;

    const availableQuantity = product.inventory.quantity - product.inventory.reservedQuantity;
    if (availableQuantity < quantity && !product.inventory.allowBackorder) {
      return false;
    }

    await Product.findByIdAndUpdate(productId, {
      $inc: { 'inventory.reservedQuantity': quantity },
    });

    return true;
  }

  // Release reserved inventory
  static async releaseReservedInventory(
    productId: string, 
    quantity: number
  ): Promise<void> {
    await Product.findByIdAndUpdate(productId, {
      $inc: { 'inventory.reservedQuantity': -quantity },
    });
  }

  // Confirm inventory (reduce actual stock)
  static async confirmInventory(
    productId: string, 
    quantity: number
  ): Promise<void> {
    await Product.findByIdAndUpdate(productId, {
      $inc: { 
        'inventory.quantity': -quantity,
        'inventory.reservedQuantity': -quantity,
      },
    });
  }

  // Get low stock products
  static async getLowStock(): Promise<IProductDocument[]> {
    return Product.find({
      isActive: true,
      'inventory.trackInventory': true,
      $expr: {
        $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'],
      },
    }).sort({ 'inventory.quantity': 1 });
  }

  // Add product images
  static async addImages(
    productId: string, 
    images: IProductDocument['images']
  ): Promise<IProductDocument | null> {
    return Product.findByIdAndUpdate(
      productId,
      { $push: { images: { $each: images } } },
      { new: true }
    );
  }

  // Remove product image
  static async removeImage(
    productId: string, 
    imageUrl: string
  ): Promise<IProductDocument | null> {
    return Product.findByIdAndUpdate(
      productId,
      { $pull: { images: { url: imageUrl } } },
      { new: true }
    );
  }

  // Get related products
  static async getRelated(
    productId: string, 
    limit = 6
  ): Promise<IProductDocument[]> {
    const product = await Product.findById(productId);
    if (!product) return [];

    return Product.find({
      _id: { $ne: productId },
      isActive: true,
      $or: [
        { category: product.category },
        { brand: product.brand },
        { tags: { $in: product.tags } },
      ],
    })
      .limit(limit)
      .sort({ 'ratings.average': -1 });
  }

  // Get products by category with aggregation
  static async getProductsByCategory(): Promise<Array<{
    _id: string;
    count: number;
    avgPrice: number;
    totalRevenue: number;
  }>> {
    return Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalRevenue: { $sum: { $multiply: ['$price', '$inventory.quantity'] } },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }
}
