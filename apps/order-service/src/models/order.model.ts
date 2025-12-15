import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'failed';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'paypal'
  | 'stripe'
  | 'bank_transfer'
  | 'cash_on_delivery';

export interface IOrderDocument extends Document {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    variantId?: string;
    name: string;
    slug: string;
    image: string;
    sku: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    paidAt?: Date;
    amount: number;
  };
  subtotal: number;
  discount: number;
  couponCode?: string;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: OrderStatus;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: Date;
    note?: string;
    updatedBy?: mongoose.Types.ObjectId;
  }>;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantId: String,
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true, min: 0 },
}, { _id: false });

const AddressSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true },
}, { _id: false });

const PaymentSchema = new Schema({
  method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'cash_on_delivery'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  transactionId: String,
  paidAt: Date,
  amount: { type: Number, required: true, min: 0 },
}, { _id: false });

const StatusHistorySchema = new Schema({
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: String,
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, { _id: false });

const OrderSchema = new Schema<IOrderDocument>({
  orderNumber: {
    type: String,
    required: true,
    uppercase: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  items: {
    type: [OrderItemSchema],
    required: true,
    validate: {
      validator: (items: unknown[]) => items.length > 0,
      message: 'Order must have at least one item',
    },
  },
  shippingAddress: {
    type: AddressSchema,
    required: true,
  },
  billingAddress: {
    type: AddressSchema,
    required: true,
  },
  payment: {
    type: PaymentSchema,
    required: true,
  },
  subtotal: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  couponCode: String,
  tax: { type: Number, required: true, min: 0 },
  shipping: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded', 'failed'],
    default: 'pending',
    index: true,
  },
  statusHistory: [StatusHistorySchema],
  trackingNumber: String,
  estimatedDelivery: Date,
  notes: String,
  metadata: Schema.Types.Mixed,
}, {
  timestamps: true,
});

// Indexes
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'payment.status': 1 });

// Generate orderNumber before validation
OrderSchema.pre('validate', async function () {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
});

export const Order = mongoose.model<IOrderDocument>('Order', OrderSchema);
