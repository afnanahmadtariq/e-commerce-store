import { Router, Request, Response, NextFunction } from 'express';
import { OrderService } from '../services';
import { PaymentService } from '../services/payment.service';

const router = Router();

/**
 * @route POST /orders/checkout
 * @desc Create new order from cart
 * @access Private
 */
router.post(
    '/checkout',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.headers['x-user-id'] as string;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }

            const {
                items,
                shippingAddress,
                billingAddress,
                paymentMethod,
                subtotal,
                discount,
                couponCode,
                tax,
                shipping,
                notes,
            } = req.body;

            // Validate required fields
            if (!items || items.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Order must have at least one item',
                });
                return;
            }

            if (!shippingAddress || !paymentMethod) {
                res.status(400).json({
                    success: false,
                    message: 'Shipping address and payment method are required',
                });
                return;
            }

            const result = await OrderService.create({
                userId,
                items,
                shippingAddress,
                billingAddress,
                paymentMethod,
                subtotal,
                discount,
                couponCode,
                tax,
                shipping,
                notes,
            });

            const responseData: any = { order: result.order };
            if (result.paymentIntent) {
                responseData.paymentIntent = {
                    id: result.paymentIntent.id,
                    client_secret: result.paymentIntent.client_secret,
                    amount: result.paymentIntent.amount,
                    currency: result.paymentIntent.currency,
                };
            }

            res.status(201).json({
                success: true,
                message: 'Order placed successfully',
                data: responseData,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /orders/confirm-payment
 * @desc Confirm Stripe payment
 * @access Private
 */
router.post(
    '/confirm-payment',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { orderId, paymentIntentId } = req.body;

            if (!orderId || !paymentIntentId) {
                res.status(400).json({
                    success: false,
                    message: 'Order ID and payment intent ID are required',
                });
                return;
            }

            const order = await OrderService.confirmPayment(orderId, paymentIntentId);

            res.status(200).json({
                success: true,
                message: 'Payment confirmed successfully',
                data: { order },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /orders/webhook
 * @desc Handle Stripe webhooks
 * @access Public
 */
router.post(
    '/webhook',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sig = req.headers['stripe-signature'] as string;
            const paymentService = new PaymentService();

            const event = await paymentService.processWebhook(req.body, sig);

            // Handle the event
            switch (event.type) {
                case 'payment_intent.succeeded':
                    const paymentIntent = event.data.object as any;
                    const orderId = paymentIntent.metadata.orderId;

                    if (orderId) {
                        try {
                            await OrderService.confirmPayment(orderId, paymentIntent.id);
                            console.log(`Payment confirmed via webhook for order: ${orderId}`);
                        } catch (error) {
                            console.error('Error confirming payment via webhook:', error);
                        }
                    }
                    break;

                case 'payment_intent.payment_failed':
                    // Handle failed payment
                    console.log('Payment failed:', event.data.object);
                    break;

                default:
                    console.log(`Unhandled event type ${event.type}`);
            }

            res.status(200).json({ received: true });
        } catch (error) {
            console.error('Webhook error:', error);
            res.status(400).send(`Webhook Error: ${error}`);
        }
    }
);

/**
 * @route GET /orders/my-orders
 * @desc Get current user's orders
 * @access Private
 */
router.get(
    '/my-orders',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.headers['x-user-id'] as string;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await OrderService.getUserOrders(userId, page, limit);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /orders/statistics
 * @desc Get order statistics (admin)
 * @access Private/Admin
 */
router.get(
    '/statistics',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const startDate = req.query.startDate
                ? new Date(req.query.startDate as string)
                : undefined;
            const endDate = req.query.endDate
                ? new Date(req.query.endDate as string)
                : undefined;

            const stats = await OrderService.getStatistics(startDate, endDate);

            res.json({
                success: true,
                data: { statistics: stats },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /orders/recent
 * @desc Get recent orders (admin)
 * @access Private/Admin
 */
router.get(
    '/recent',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit = parseInt(req.query.limit as string) || 10;
            const orders = await OrderService.getRecentOrders(limit);

            res.json({
                success: true,
                data: { orders },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /orders/sales
 * @desc Get sales by date (admin)
 * @access Private/Admin
 */
router.get(
    '/sales',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const startDate = req.query.startDate
                ? new Date(req.query.startDate as string)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
            const endDate = req.query.endDate
                ? new Date(req.query.endDate as string)
                : new Date();
            const groupBy = (req.query.groupBy as 'day' | 'week' | 'month') || 'day';

            const sales = await OrderService.getSalesByDate(startDate, endDate, groupBy);

            res.json({
                success: true,
                data: { sales },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /orders/top-products
 * @desc Get top selling products (admin)
 * @access Private/Admin
 */
router.get(
    '/top-products',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit = parseInt(req.query.limit as string) || 10;
            const products = await OrderService.getTopSellingProducts(limit);

            res.json({
                success: true,
                data: { products },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /orders
 * @desc Get all orders with filtering (admin)
 * @access Private/Admin
 */
router.get(
    '/',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const filters = {
                userId: req.query.userId as string,
                status: req.query.status as string,
                paymentStatus: req.query.paymentStatus as string,
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
                minTotal: req.query.minTotal ? parseFloat(req.query.minTotal as string) : undefined,
                maxTotal: req.query.maxTotal ? parseFloat(req.query.maxTotal as string) : undefined,
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 20,
                sortBy: (req.query.sortBy as 'createdAt' | 'total' | 'status') || 'createdAt',
                sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
            };

            const result = await OrderService.getAll(filters);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /orders/number/:orderNumber
 * @desc Get order by order number
 * @access Private
 */
router.get(
    '/number/:orderNumber',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const order = await OrderService.getByOrderNumber(req.params.orderNumber);

            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
                return;
            }

            // Check authorization
            const userId = req.headers['x-user-id'] as string;
            const userRole = req.headers['x-user-role'] as string;

            if (userRole !== 'admin' && order.userId.toString() !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            res.json({
                success: true,
                data: { order },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route GET /orders/:id
 * @desc Get order by ID
 * @access Private
 */
router.get(
    '/:id',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const order = await OrderService.getById(req.params.id);

            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
                return;
            }

            // Check authorization
            const userId = req.headers['x-user-id'] as string;
            const userRole = req.headers['x-user-role'] as string;

            if (userRole !== 'admin' && order.userId.toString() !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            res.json({
                success: true,
                data: { order },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route PUT /orders/:id/status
 * @desc Update order status (admin)
 * @access Private/Admin
 */
router.put(
    '/:id/status',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { status, note } = req.body;
            const updatedBy = req.headers['x-user-id'] as string;

            if (!status) {
                res.status(400).json({
                    success: false,
                    message: 'Status is required',
                });
                return;
            }

            const order = await OrderService.updateStatus(
                req.params.id,
                status,
                note,
                updatedBy
            );

            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
                return;
            }

            res.json({
                success: true,
                message: 'Order status updated',
                data: { order },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route PUT /orders/:id/cancel
 * @desc Cancel order
 * @access Private
 */
router.put(
    '/:id/cancel',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.headers['x-user-id'] as string;
            const { reason } = req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }

            const order = await OrderService.cancel(req.params.id, userId, reason);

            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'Order not found or cannot be cancelled',
                });
                return;
            }

            res.json({
                success: true,
                message: 'Order cancelled successfully',
                data: { order },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route PUT /orders/:id/payment
 * @desc Update payment status (admin/webhook)
 * @access Private/Admin
 */
router.put(
    '/:id/payment',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { status, transactionId } = req.body;

            if (!status) {
                res.status(400).json({
                    success: false,
                    message: 'Payment status is required',
                });
                return;
            }

            const order = await OrderService.updatePaymentStatus(
                req.params.id,
                status,
                transactionId
            );

            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
                return;
            }

            res.json({
                success: true,
                message: 'Payment status updated',
                data: { order },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route PUT /orders/:id/tracking
 * @desc Add tracking number (admin)
 * @access Private/Admin
 */
router.put(
    '/:id/tracking',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { trackingNumber } = req.body;

            if (!trackingNumber) {
                res.status(400).json({
                    success: false,
                    message: 'Tracking number is required',
                });
                return;
            }

            const order = await OrderService.addTrackingNumber(
                req.params.id,
                trackingNumber
            );

            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
                return;
            }

            res.json({
                success: true,
                message: 'Tracking number added',
                data: { order },
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
