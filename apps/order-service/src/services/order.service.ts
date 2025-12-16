import { Order, IOrderDocument, OrderStatus, PaymentStatus, PaymentMethod } from '../models/order.model';
import { PaymentService } from './payment.service';
import axios from 'axios';

export interface CreateOrderData {
    userId: string;
    items: Array<{
        productId: string;
        variantId?: string;
        name: string;
        slug: string;
        image: string;
        sku: string;
        price: number;
        quantity: number;
    }>;
    shippingAddress: IOrderDocument['shippingAddress'];
    billingAddress?: IOrderDocument['billingAddress'];
    paymentMethod: PaymentMethod;
    subtotal: number;
    discount?: number;
    couponCode?: string;
    tax: number;
    shipping: number;
    notes?: string;
}

export interface OrderFilter {
    userId?: string;
    status?: OrderStatus | string;
    paymentStatus?: PaymentStatus | string;
    startDate?: Date;
    endDate?: Date;
    minTotal?: number;
    maxTotal?: number;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'total' | 'status';
    sortOrder?: 'asc' | 'desc';
}

// Valid status transitions
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled', 'failed'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['out_for_delivery', 'delivered'],
    out_for_delivery: ['delivered'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: [],
    failed: ['pending'],
};

export class OrderService {
    // Create new order
    static async create(data: CreateOrderData): Promise<{ order: IOrderDocument; paymentIntent?: any }> {
        // Calculate item subtotals
        const items = data.items.map((item) => ({
            ...item,
            subtotal: item.price * item.quantity,
        }));

        // Calculate total
        const total = data.subtotal - (data.discount || 0) + data.tax + data.shipping;

        const orderData = {
            userId: data.userId,
            items,
            shippingAddress: data.shippingAddress,
            billingAddress: data.billingAddress || data.shippingAddress,
            payment: {
                method: data.paymentMethod,
                status: data.paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
                amount: total,
            },
            subtotal: data.subtotal,
            discount: data.discount || 0,
            couponCode: data.couponCode,
            tax: data.tax,
            shipping: data.shipping,
            total,
            status: 'pending',
            statusHistory: [{
                status: 'pending',
                timestamp: new Date(),
                note: 'Order placed',
            }],
            notes: data.notes,
        };

        const order = new Order(orderData);
        await order.save();

        let paymentIntent;

        // Create payment intent for Stripe payments
        if (data.paymentMethod === 'stripe') {
            const paymentService = new PaymentService();
            paymentIntent = await paymentService.createPaymentIntent({
                amount: total,
                currency: 'USD', // You can make this configurable
                orderId: order._id.toString(),
                customerEmail: data.shippingAddress.email,
                metadata: {
                    orderNumber: order.orderNumber,
                    userId: data.userId,
                },
            });

            // Update order with payment intent ID
            order.payment.transactionId = paymentIntent.id;
            await order.save();
        }

        // TODO: Emit order.created event for inventory reservation
        console.log(`Order created: ${order.orderNumber}`);

        return { order, paymentIntent };
    }

    static async confirmPayment(orderId: string, paymentIntentId: string): Promise<IOrderDocument> {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        if (order.payment.method !== 'stripe') {
            throw new Error('Payment method not supported for confirmation');
        }

        // Verify payment intent
        const paymentService = new PaymentService();
        const paymentIntent = await paymentService.confirmPaymentIntent(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            // Update payment status
            order.payment.status = 'captured';
            order.payment.transactionId = paymentIntentId;
            order.payment.paidAt = new Date();

            // Update order status
            order.status = 'confirmed';
            order.statusHistory.push({
                status: 'confirmed',
                timestamp: new Date(),
                note: 'Payment received',
            });

            await order.save();

            // Update inventory for each item
            const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
            for (const item of order.items) {
                try {
                    await axios.patch(`${productServiceUrl}/products/${item.productId}/confirm-inventory`, {
                        quantity: item.quantity,
                    });
                    console.log(`Updated inventory for product ${item.productId}: -${item.quantity}`);
                } catch (error) {
                    console.error(`Failed to update inventory for product ${item.productId}:`, error);
                    // Continue with other items even if one fails
                }
            }

            // TODO: Emit order.confirmed event

            console.log(`Payment confirmed for order: ${order.orderNumber}`);
        } else {
            throw new Error('Payment not completed');
        }

        return order;
    }

    // Get order by ID
    static async getById(id: string): Promise<IOrderDocument | null> {
        return Order.findById(id);
    }

    // Get order by order number
    static async getByOrderNumber(orderNumber: string): Promise<IOrderDocument | null> {
        return Order.findOne({ orderNumber: orderNumber.toUpperCase() });
    }

    // Get orders with filtering
    static async getAll(filters: OrderFilter = {}) {
        const {
            userId,
            status,
            paymentStatus,
            startDate,
            endDate,
            minTotal,
            maxTotal,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = filters;

        const query: Record<string, unknown> = {};

        if (userId) query.userId = userId;
        if (status) query.status = status;
        if (paymentStatus) query['payment.status'] = paymentStatus;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) (query.createdAt as Record<string, Date>).$gte = startDate;
            if (endDate) (query.createdAt as Record<string, Date>).$lte = endDate;
        }

        if (minTotal !== undefined || maxTotal !== undefined) {
            query.total = {};
            if (minTotal !== undefined) (query.total as Record<string, number>).$gte = minTotal;
            if (maxTotal !== undefined) (query.total as Record<string, number>).$lte = maxTotal;
        }

        const sortOptions: Record<string, 1 | -1> = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit);

        return {
            orders,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // Get user orders
    static async getUserOrders(
        userId: string,
        page = 1,
        limit = 10
    ): Promise<{
        orders: IOrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const total = await Order.countDocuments({ userId });
        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return {
            orders,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    // Update order status
    static async updateStatus(
        orderId: string,
        newStatus: OrderStatus,
        note?: string,
        updatedBy?: string
    ): Promise<IOrderDocument | null> {
        const order = await Order.findById(orderId);
        if (!order) return null;

        // Validate status transition
        const allowedTransitions = STATUS_TRANSITIONS[order.status];
        if (!allowedTransitions.includes(newStatus)) {
            throw new Error(
                `Invalid status transition from ${order.status} to ${newStatus}`
            );
        }

        order.status = newStatus;
        order.statusHistory.push({
            status: newStatus,
            timestamp: new Date(),
            note,
            updatedBy: updatedBy as unknown as IOrderDocument['statusHistory'][0]['updatedBy'],
        });

        // Handle specific status changes
        if (newStatus === 'confirmed') {
            // TODO: Confirm inventory reservation
            console.log(`Order ${order.orderNumber} confirmed`);
        } else if (newStatus === 'shipped') {
            // Set estimated delivery (5-7 business days)
            const estimatedDelivery = new Date();
            estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
            order.estimatedDelivery = estimatedDelivery;
        } else if (newStatus === 'cancelled') {
            // TODO: Release inventory reservation
            console.log(`Order ${order.orderNumber} cancelled`);
        } else if (newStatus === 'delivered') {
            // TODO: Confirm inventory reduction
            console.log(`Order ${order.orderNumber} delivered`);
        }

        await order.save();

        // TODO: Emit status change event
        console.log(`Order ${order.orderNumber} status changed to ${newStatus}`);

        return order;
    }

    // Cancel order
    static async cancel(
        orderId: string,
        userId: string,
        reason?: string
    ): Promise<IOrderDocument | null> {
        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) return null;

        // Check if can be cancelled
        const cancellableStatuses: OrderStatus[] = ['pending', 'confirmed', 'processing'];
        if (!cancellableStatuses.includes(order.status)) {
            throw new Error(`Order cannot be cancelled in ${order.status} status`);
        }

        return this.updateStatus(orderId, 'cancelled', reason || 'Cancelled by customer', userId);
    }

    // Update payment status
    static async updatePaymentStatus(
        orderId: string,
        paymentStatus: PaymentStatus,
        transactionId?: string
    ): Promise<IOrderDocument | null> {
        const update: Record<string, unknown> = {
            'payment.status': paymentStatus,
        };

        if (transactionId) {
            update['payment.transactionId'] = transactionId;
        }

        if (paymentStatus === 'captured') {
            update['payment.paidAt'] = new Date();
        }

        const order = await Order.findByIdAndUpdate(orderId, update, { new: true });

        if (order && paymentStatus === 'captured') {
            // Auto-confirm order when payment is captured
            await this.updateStatus(orderId, 'confirmed', 'Payment received');
        }

        return order;
    }

    // Add tracking number
    static async addTrackingNumber(
        orderId: string,
        trackingNumber: string
    ): Promise<IOrderDocument | null> {
        return Order.findByIdAndUpdate(
            orderId,
            {
                trackingNumber,
                status: 'shipped',
                $push: {
                    statusHistory: {
                        status: 'shipped',
                        timestamp: new Date(),
                        note: `Tracking number: ${trackingNumber}`,
                    },
                },
            },
            { new: true }
        );
    }

    // Get order statistics
    static async getStatistics(startDate?: Date, endDate?: Date) {
        const matchStage: Record<string, unknown> = {};

        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) (matchStage.createdAt as Record<string, Date>).$gte = startDate;
            if (endDate) (matchStage.createdAt as Record<string, Date>).$lte = endDate;
        }

        const stats = await Order.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered']] },
                                '$total',
                                0
                            ]
                        }
                    },
                    averageOrderValue: { $avg: '$total' },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    confirmedOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    },
                    shippedOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
                    },
                    deliveredOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                    },
                    cancelledOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    },
                },
            },
        ]);

        return stats[0] || {
            totalOrders: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            pendingOrders: 0,
            confirmedOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
        };
    }

    // Get recent orders
    static async getRecentOrders(limit = 10): Promise<IOrderDocument[]> {
        return Order.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('orderNumber userId total status createdAt');
    }

    // Get sales by date
    static async getSalesByDate(
        startDate: Date,
        endDate: Date,
        groupBy: 'day' | 'week' | 'month' = 'day'
    ) {
        const dateFormat = {
            day: '%Y-%m-%d',
            week: '%Y-W%V',
            month: '%Y-%m',
        };

        return Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $nin: ['cancelled', 'failed', 'refunded'] },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat[groupBy], date: '$createdAt' } },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                    averageOrderValue: { $avg: '$total' },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }

    // Get top selling products
    static async getTopSellingProducts(limit = 10) {
        return Order.aggregate([
            { $match: { status: { $nin: ['cancelled', 'failed', 'refunded'] } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    name: { $first: '$items.name' },
                    image: { $first: '$items.image' },
                    totalSold: { $sum: '$items.quantity' },
                    revenue: { $sum: '$items.subtotal' },
                },
            },
            { $sort: { totalSold: -1 } },
            { $limit: limit },
        ]);
    }
}
