import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="order-detail-page">
      <div class="container">
        @if (loading) {
          <div class="loading-state"><div class="spinner"></div><p>Loading order...</p></div>
        } @else if (order) {
          <div class="order-header-section">
            <div>
              <a routerLink="/orders" class="back-link">← Back to Orders</a>
              <h1>Order #{{ order.orderNumber }}</h1>
              <p class="order-date">Placed on {{ order.createdAt | date:'medium' }}</p>
            </div>
            <div class="order-status-badge" [style.background-color]="orderService.getStatusColor(order.status) + '20'" [style.color]="orderService.getStatusColor(order.status)">
              {{ orderService.getStatusLabel(order.status) }}
            </div>
          </div>
          <div class="order-layout">
            <div class="order-main">
              <div class="card">
                <div class="card-header"><h2>Order Items</h2></div>
                <div class="card-body">
                  @for (item of order.items; track item.productId) {
                    <div class="order-item">
                      <img [src]="item.image || 'https://via.placeholder.com/80'" [alt]="item.name" />
                      <div class="item-info">
                        <a [routerLink]="['/products', item.slug]" class="item-name">{{ item.name }}</a>
                        <span class="item-sku">SKU: {{ item.sku }}</span>
                        <span class="item-qty">Qty: {{ item.quantity }} × \${{ item.price.toFixed(2) }}</span>
                      </div>
                      <span class="item-total">\${{ item.subtotal.toFixed(2) }}</span>
                    </div>
                  }
                </div>
              </div>
              @if (order.trackingNumber) {
                <div class="card">
                  <div class="card-header"><h2>Tracking</h2></div>
                  <div class="card-body">
                    <p><strong>Tracking Number:</strong> {{ order.trackingNumber }}</p>
                    @if (order.estimatedDelivery) {
                      <p><strong>Estimated Delivery:</strong> {{ order.estimatedDelivery | date:'mediumDate' }}</p>
                    }
                  </div>
                </div>
              }
            </div>
            <aside class="order-sidebar">
              <div class="card">
                <div class="card-header"><h2>Order Summary</h2></div>
                <div class="card-body">
                  <div class="summary-row"><span>Subtotal</span><span>\${{ order.subtotal.toFixed(2) }}</span></div>
                  <div class="summary-row"><span>Shipping</span><span>\${{ order.shipping.toFixed(2) }}</span></div>
                  <div class="summary-row"><span>Tax</span><span>\${{ order.tax.toFixed(2) }}</span></div>
                  @if (order.discount > 0) {
                    <div class="summary-row discount"><span>Discount</span><span>-\${{ order.discount.toFixed(2) }}</span></div>
                  }
                  <div class="divider"></div>
                  <div class="summary-row total"><span>Total</span><span>\${{ order.total.toFixed(2) }}</span></div>
                </div>
              </div>
              <div class="card">
                <div class="card-header"><h2>Shipping Address</h2></div>
                <div class="card-body">
                  <p>{{ order.shippingAddress.firstName }} {{ order.shippingAddress.lastName }}</p>
                  <p>{{ order.shippingAddress.street }}</p>
                  <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zipCode }}</p>
                  <p>{{ order.shippingAddress.country }}</p>
                </div>
              </div>
              <div class="card">
                <div class="card-header"><h2>Payment</h2></div>
                <div class="card-body">
                  <p><strong>Method:</strong> {{ order.payment.method | titlecase }}</p>
                  <p><strong>Status:</strong> {{ order.payment.status | titlecase }}</p>
                </div>
              </div>
              @if (canCancel()) {
                <button class="btn btn-danger" (click)="cancelOrder()" [disabled]="cancelling">
                  {{ cancelling ? 'Cancelling...' : 'Cancel Order' }}
                </button>
              }
            </aside>
          </div>
        } @else {
          <div class="error-state">
            <h2>Order not found</h2>
            <a routerLink="/orders" class="btn btn-primary">View All Orders</a>
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    .order-detail-page { padding: var(--space-xl) 0 var(--space-3xl); }
    .loading-state, .error-state { text-align: center; padding: var(--space-3xl); }
    .back-link { color: var(--gray-500); font-size: 0.875rem; display: inline-block; margin-bottom: var(--space-sm); }
    .order-header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-xl); }
    .order-header-section h1 { font-size: 2rem; margin-bottom: var(--space-xs); }
    .order-date { color: var(--gray-500); }
    .order-status-badge { padding: 0.5rem 1rem; border-radius: var(--radius-full); font-weight: 600; font-size: 0.875rem; }
    .order-layout { display: grid; grid-template-columns: 1fr 350px; gap: var(--space-xl); align-items: start; }
    @media (max-width: 1024px) { .order-layout { grid-template-columns: 1fr; } }
    .order-main { display: flex; flex-direction: column; gap: var(--space-lg); }
    .order-sidebar { display: flex; flex-direction: column; gap: var(--space-lg); }
    .order-item { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md) 0; border-bottom: 1px solid var(--gray-100); }
    .order-item:last-child { border-bottom: none; }
    .order-item img { width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-md); }
    .item-info { flex: 1; display: flex; flex-direction: column; }
    .item-name { font-weight: 600; color: var(--gray-900); text-decoration: none; }
    .item-name:hover { color: var(--primary-600); }
    .item-sku, .item-qty { font-size: 0.875rem; color: var(--gray-500); }
    .item-total { font-weight: 600; font-size: 1.125rem; }
    .summary-row { display: flex; justify-content: space-between; padding: var(--space-sm) 0; }
    .summary-row.discount span:last-child { color: var(--success-600); }
    .summary-row.total { font-size: 1.25rem; font-weight: 700; }
    .card-header h2 { font-size: 1rem; }
  `]
})
export class OrderDetailComponent implements OnInit {
    orderService = inject(OrderService);
    route = inject(ActivatedRoute);

    order: Order | null = null;
    loading = true;
    cancelling = false;

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.loadOrder(params['id']);
        });
    }

    loadOrder(id: string): void {
        this.loading = true;
        this.orderService.getOrder(id).subscribe({
            next: (order) => { this.order = order; this.loading = false; },
            error: () => { this.order = null; this.loading = false; }
        });
    }

    canCancel(): boolean {
        if (!this.order) return false;
        return ['pending', 'confirmed'].includes(this.order.status);
    }

    cancelOrder(): void {
        if (!this.order || !this.canCancel()) return;
        if (!confirm('Are you sure you want to cancel this order?')) return;

        this.cancelling = true;
        this.orderService.cancelOrder(this.order._id).subscribe({
            next: (order) => { this.order = order; this.cancelling = false; },
            error: () => { this.cancelling = false; }
        });
    }
}
