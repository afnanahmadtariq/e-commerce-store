import mongoose, { Schema, Document } from 'mongoose';

export interface ICartDocument extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    variantId?: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    originalPrice: number;
    quantity: number;
    maxQuantity: number;
    subtotal: number;
  }>;
  coupon?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
  };
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantId: String,
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  maxQuantity: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
}, { _id: true });

const CouponSchema = new Schema({
  code: { type: String, required: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  discountAmount: { type: Number, required: true, min: 0 },
}, { _id: false });

const CartSchema = new Schema<ICartDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  sessionId: {
    type: String,
    index: true,
  },
  items: [CartItemSchema],
  coupon: CouponSchema,
  subtotal: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  shipping: { type: Number, default: 0, min: 0 },
  total: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'USD' },
}, {
  timestamps: true,
});

// Compound index for cart lookup
CartSchema.index({ userId: 1, sessionId: 1 });

// TTL index for guest carts (expire after 7 days of inactivity)
CartSchema.index(
  { updatedAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60, partialFilterExpression: { userId: { $exists: false } } }
);

export const Cart = mongoose.model<ICartDocument>('Cart', CartSchema);
