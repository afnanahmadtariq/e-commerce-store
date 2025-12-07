import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId;
  image?: string;
  icon?: string;
  isActive: boolean;
  order: number;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: String,
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  image: String,
  icon: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  productCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ isActive: 1, order: 1 });

// Generate slug before saving
CategorySchema.pre('save', async function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

export const Category = mongoose.model<ICategoryDocument>('Category', CategorySchema);
