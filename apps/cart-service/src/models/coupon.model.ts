import mongoose, { Schema, Document } from 'mongoose';

export interface ICouponDocument extends Document {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  perUserLimit: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableProducts?: mongoose.Types.ObjectId[];
  applicableCategories?: string[];
  excludedProducts?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICouponDocument>({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: String,
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required'],
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative'],
  },
  minOrderAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  maxDiscountAmount: {
    type: Number,
    min: 0,
  },
  usageLimit: {
    type: Number,
    min: 0,
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  perUserLimit: {
    type: Number,
    default: 1,
    min: 1,
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required'],
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  applicableProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  applicableCategories: [String],
  excludedProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
}, {
  timestamps: true,
});

// Indexes
CouponSchema.index({ code: 1 });
CouponSchema.index({ validFrom: 1, validUntil: 1, isActive: 1 });

export const Coupon = mongoose.model<ICouponDocument>('Coupon', CouponSchema);
