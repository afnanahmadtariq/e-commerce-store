import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Address } from './auth.service';

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

export type PaymentMethod =
    | 'credit_card'
    | 'debit_card'
    | 'stripe'
    | 'bank_transfer'
    | 'cash_on_delivery';

export interface OrderItem {
    productId: string;
    variantId?: string;
    name: string;
    slug: string;
    image: string;
    sku: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface Order {
    _id: string;
    orderNumber: string;
    userId: string;
    items: OrderItem[];
    shippingAddress: Address & { firstName: string; lastName: string; email: string; phone: string };
    billingAddress: Address & { firstName: string; lastName: string; email: string; phone: string };
    payment: {
        method: PaymentMethod;
        status: string;
        transactionId?: string;
        paidAt?: string;
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
        timestamp: string;
        note?: string;
    }>;
    trackingNumber?: string;
    estimatedDelivery?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderRequest {
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
    shippingAddress: Address & { firstName: string; lastName: string; email: string; phone: string };
    billingAddress?: Address & { firstName: string; lastName: string; email: string; phone: string };
    paymentMethod: PaymentMethod;
    subtotal: number;
    discount: number;
    couponCode?: string;
    tax: number;
    shipping: number;
    notes?: string;
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    orders = signal<Order[]>([]);
    currentOrder = signal<Order | null>(null);
    loading = signal(false);
    totalOrders = signal(0);

    private readonly http = inject(HttpClient);

    createOrder(data: CreateOrderRequest): Observable<Order> {
        this.loading.set(true);
        return this.http.post<{ success: boolean; data: { order: Order } }>(
            `${environment.apiUrl}/orders/checkout`,
            data
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.currentOrder.set(response.data.order);
                }
                this.loading.set(false);
            }),
            map(response => response.data.order)
        );
    }

    getMyOrders(page = 1, limit = 10): Observable<{ orders: Order[]; total: number; page: number; totalPages: number }> {
        this.loading.set(true);
        return this.http.get<{ success: boolean; data: { orders: Order[]; total: number; page: number; totalPages: number } }>(
            `${environment.apiUrl}/orders/my-orders?page=${page}&limit=${limit}`
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.orders.set(response.data.orders);
                    this.totalOrders.set(response.data.total);
                }
                this.loading.set(false);
            }),
            map(response => response.data)
        );
    }

    getOrder(id: string): Observable<Order> {
        this.loading.set(true);
        return this.http.get<{ success: boolean; data: { order: Order } }>(
            `${environment.apiUrl}/orders/${id}`
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.currentOrder.set(response.data.order);
                }
                this.loading.set(false);
            }),
            map(response => response.data.order)
        );
    }

    getOrderByNumber(orderNumber: string): Observable<Order> {
        return this.http.get<{ success: boolean; data: { order: Order } }>(
            `${environment.apiUrl}/orders/number/${orderNumber}`
        ).pipe(
            map(response => response.data.order)
        );
    }

    cancelOrder(id: string, reason?: string): Observable<Order> {
        this.loading.set(true);
        return this.http.put<{ success: boolean; data: { order: Order } }>(
            `${environment.apiUrl}/orders/${id}/cancel`,
            { reason }
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.currentOrder.set(response.data.order);
                    // Update orders list
                    const orders = this.orders();
                    const index = orders.findIndex(o => o._id === id);
                    if (index !== -1) {
                        orders[index] = response.data.order;
                        this.orders.set([...orders]);
                    }
                }
                this.loading.set(false);
            }),
            map(response => response.data.order)
        );
    }

    getStatusColor(status: OrderStatus): string {
        const colors: Record<OrderStatus, string> = {
            pending: '#f59e0b',
            confirmed: '#10b981',
            processing: '#3b82f6',
            shipped: '#8b5cf6',
            out_for_delivery: '#6366f1',
            delivered: '#22c55e',
            cancelled: '#ef4444',
            refunded: '#f97316',
            failed: '#dc2626',
        };
        return colors[status] || '#6b7280';
    }

    getStatusLabel(status: OrderStatus): string {
        const labels: Record<OrderStatus, string> = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            processing: 'Processing',
            shipped: 'Shipped',
            out_for_delivery: 'Out for Delivery',
            delivered: 'Delivered',
            cancelled: 'Cancelled',
            refunded: 'Refunded',
            failed: 'Failed',
        };
        return labels[status] || status;
    }
}
