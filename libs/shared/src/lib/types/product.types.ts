// Product Types for E-Commerce Platform

export interface IProduct {
  _id?: string;
  name: string;
  slug: string;
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
  images: IProductImage[];
  variants?: IProductVariant[];
  inventory: IInventory;
  specifications?: Record<string, string>;
  ratings: IRatings;
  isActive: boolean;
  isFeatured: boolean;
  vendorId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
}

export interface IProductVariant {
  _id?: string;
  name: string;
  sku: string;
  price: number;
  inventory: number;
  attributes: Record<string, string>;
}

export interface IInventory {
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorder: boolean;
}

export interface IRatings {
  average: number;
  count: number;
}

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductFilter {
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
}

export interface IProductReview {
  _id?: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  content: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPaginatedProducts {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
