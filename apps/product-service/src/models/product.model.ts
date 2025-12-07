import mongoose, { Schema, Document } from 'mongoose';

export interface IProductDocument extends Document {
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
  tags: string[];
  images: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
    order: number;
  }>;
  variants: Array<{
    name: string;
    sku: string;
    price: number;
    inventory: number;
    attributes: Record<string, string>;
  }>;
  inventory: {
    quantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
    trackInventory: boolean;
    allowBackorder: boolean;
  };
  specifications: Record<string, string>;
  ratings: {
    average: number;
    count: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  vendorId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  availableQuantity: number;
}

const ImageSchema = new Schema({
  url: { type: String, required: true },
  alt: String,
  isPrimary: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { _id: false });

const VariantSchema = new Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  inventory: { type: Number, default: 0, min: 0 },
  attributes: { type: Map, of: String },
}, { _id: true });

const InventorySchema = new Schema({
  quantity: { type: Number, default: 0, min: 0 },
  reservedQuantity: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 10, min: 0 },
  trackInventory: { type: Boolean, default: true },
  allowBackorder: { type: Boolean, default: false },
}, { _id: false });

const ProductSchema = new Schema<IProductDocument>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  shortDescription: String,
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  compareAtPrice: {
    type: Number,
    min: 0,
  },
  costPrice: {
    type: Number,
    min: 0,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    index: true,
  },
  subcategory: {
    type: String,
    index: true,
  },
  brand: {
    type: String,
    index: true,
  },
  tags: [{ type: String, trim: true }],
  images: [ImageSchema],
  variants: [VariantSchema],
  inventory: {
    type: InventorySchema,
    default: () => ({}),
  },
  specifications: {
    type: Map,
    of: String,
    default: {},
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 },
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true,
  },
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for available quantity
ProductSchema.virtual('availableQuantity').get(function (this: IProductDocument) {
  return this.inventory.quantity - this.inventory.reservedQuantity;
});

// Indexes for search and filtering
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ price: 1 });
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ 'ratings.average': -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });

// Generate slug before saving
ProductSchema.pre('save', function() {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

export const Product = mongoose.model<IProductDocument>('Product', ProductSchema);
