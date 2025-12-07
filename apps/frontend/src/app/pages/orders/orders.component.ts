import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="orders-page">
      <div class="container">
        <h1>My Orders</h1>

        @if (orderService.loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading orders...</p>
          </div>
        } @else if (orders.length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>When you place an order, it will appear here.</p>
            <a routerLink="/products" class="btn btn-primary btn-lg">Start Shopping</a>
          </div>
        } @else {
          <div class="orders-list">
            @for (order of orders; track order._id) {
              <div class="order-card card">
                <div class="order-header">
                  <div class="order-info">
                    <h3>Order #{{ order.orderNumber }}</h3>
                    <span class="order-date">{{ order.createdAt | date:'medium' }}</span>
                  </div>
                  <div 
                    class="order-status" 
                    [style.background-color]="orderService.getStatusColor(order.status) + '1a'"
                    [style.color]="orderService.getStatusColor(order.status)"
                  >
                    {{ orderService.getStatusLabel(order.status) }}
                  </div>
                </div>

                <div class="order-items">
                  @for (item of order.items.slice(0, 3); track item.productId) {
                    <div class="order-item">
                      <img [src]="item.image || 'https://via.placeholder.com/60'" [alt]="item.name" />
                      <div class="item-info">
                        <span class="item-name">{{ item.name }}</span>
                        <span class="item-qty">Qty: {{ item.quantity }}</span>
                      </div>
                      <span class="item-price">\${{ item.subtotal.toFixed(2) }}</span>
                    </div>
                  }
                  @if (order.items.length > 3) {
                    <p class="more-items">+{{ order.items.length - 3 }} more items</p>
                  }
                </div>

                <div class="order-footer">
                  <div class="order-total">
                    <span>Total:</span>
                    <strong>\${{ order.total.toFixed(2) }}</strong>
                  </div>
                  <a [routerLink]="['/orders', order._id]" class="btn btn-secondary">View Details</a>
                </div>
              </div>
            }
          </div>

          @if (totalPages > 1) {
            <div class="pagination">
              <button 
                class="btn btn-secondary" 
                [disabled]="currentPage === 1"
                (click)="goToPage(currentPage - 1)"
              >Previous</button>
              <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
              <button 
                class="btn btn-secondary" 
                [disabled]="currentPage === totalPages"
                (click)="goToPage(currentPage + 1)"
              >Next</button>
            </div>
          }
        }
      </div>
    </div>
  `,
    styles: [`
    .orders-page {
      padding: var(--space-xl) 0 var(--space-3xl);
      min-height: 60vh;
    }

    .orders-page h1 {
      font-size: 2rem;
      margin-bottom: var(--space-xl);
    }

    .loading-state,
    .empty-state {
      text-align: center;
      padding: var(--space-3xl);
    }

    .empty-icon {
      font-size: 5rem;
      margin-bottom: var(--space-lg);
    }

    .empty-state h2 {
      font-size: 1.5rem;
      margin-bottom: var(--space-sm);
    }

    .empty-state p {
      margin-bottom: var(--space-xl);
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }

    .order-card {
      padding: var(--space-lg);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-lg);
      padding-bottom: var(--space-md);
      border-bottom: 1px solid var(--gray-100);
    }

    .order-info h3 {
      font-size: 1rem;
      margin-bottom: var(--space-xs);
    }

    .order-date {
      font-size: 0.875rem;
      color: var(--gray-500);
    }

    .order-status {
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .order-items {
      margin-bottom: var(--space-lg);
    }

    .order-item {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-sm) 0;
    }

    .order-item img {
      width: 60px;
      height: 60px;
      border-radius: var(--radius-md);
      object-fit: cover;
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .item-name {
      font-weight: 500;
      color: var(--gray-800);
    }

    .item-qty {
      font-size: 0.875rem;
      color: var(--gray-500);
    }

    .item-price {
      font-weight: 600;
      color: var(--gray-900);
    }

    .more-items {
      font-size: 0.875rem;
      color: var(--gray-500);
      padding-top: var(--space-sm);
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-md);
      border-top: 1px solid var(--gray-100);
    }

    .order-total {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-size: 1rem;
    }

    .order-total span {
      color: var(--gray-600);
    }

    .order-total strong {
      font-size: 1.25rem;
      color: var(--gray-900);
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-lg);
      margin-top: var(--space-xl);
    }

    .page-info {
      font-size: 0.875rem;
      color: var(--gray-600);
    }
  `]
})
export class OrdersComponent implements OnInit {
    orderService = inject(OrderService);

    orders: Order[] = [];
    currentPage = 1;
    totalPages = 1;

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        this.orderService.getMyOrders(this.currentPage).subscribe({
            next: (data) => {
                this.orders = data.orders;
                this.totalPages = data.totalPages;
            }
        });
    }

    goToPage(page: number): void {
        this.currentPage = page;
        this.loadOrders();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
