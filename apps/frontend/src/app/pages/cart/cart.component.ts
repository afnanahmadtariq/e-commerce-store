import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div class="cart-page">
      <div class="container">
        <h1>Shopping Cart</h1>
        
        @if (cartService.isEmpty()) {
          <div class="empty-cart">
            <div class="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <a routerLink="/products" class="btn btn-primary btn-lg">Start Shopping</a>
          </div>
        } @else {
          <div class="cart-layout">
            <!-- Cart Items -->
            <div class="cart-items">
              @for (item of cartService.cart()?.items; track item._id) {
                <div class="cart-item card">
                  <a [routerLink]="['/products', item.slug]" class="item-image">
                    <img [src]="item.image || 'https://via.placeholder.com/100'" [alt]="item.name" />
                  </a>
                  <div class="item-details">
                    <a [routerLink]="['/products', item.slug]" class="item-name">{{ item.name }}</a>
                    <p class="item-price">\${{ item.price.toFixed(2) }}</p>
                  </div>
                  <div class="item-quantity">
                    <button 
                      class="qty-btn" 
                      (click)="updateQuantity(item, item.quantity - 1)"
                      [disabled]="item.quantity <= 1"
                    >-</button>
                    <input 
                      type="number" 
                      [value]="item.quantity" 
                      (change)="onQuantityChange(item, $event)"
                      min="1"
                      [max]="item.maxQuantity"
                      class="qty-input"
                    />
                    <button 
                      class="qty-btn" 
                      (click)="updateQuantity(item, item.quantity + 1)"
                      [disabled]="item.quantity >= item.maxQuantity"
                    >+</button>
                  </div>
                  <div class="item-subtotal">
                    <span class="subtotal-label">Subtotal</span>
                    <span class="subtotal-value">\${{ item.subtotal.toFixed(2) }}</span>
                  </div>
                  <button class="remove-btn" (click)="removeItem(item._id)">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              }
              
              <button class="btn btn-ghost" (click)="clearCart()">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Clear Cart
              </button>
            </div>

            <!-- Order Summary -->
            <aside class="order-summary">
              <div class="summary-card card">
                <div class="card-header">
                  <h2>Order Summary</h2>
                </div>
                <div class="card-body">
                  <!-- Coupon -->
                  <div class="coupon-section">
                    @if (cartService.cart()?.coupon) {
                      <div class="applied-coupon">
                        <span>
                          <strong>{{ cartService.cart()?.coupon?.code }}</strong> applied
                        </span>
                        <button class="btn btn-ghost btn-sm" (click)="removeCoupon()">Remove</button>
                      </div>
                    } @else {
                      <div class="coupon-form">
                        <input 
                          type="text" 
                          placeholder="Coupon code" 
                          [(ngModel)]="couponCode"
                          class="form-input"
                        />
                        <button 
                          class="btn btn-secondary" 
                          (click)="applyCoupon()"
                          [disabled]="!couponCode || applyingCoupon"
                        >
                          @if (applyingCoupon) {
                            <div class="spinner spinner-sm"></div>
                          } @else {
                            Apply
                          }
                        </button>
                      </div>
                      @if (couponError) {
                        <p class="form-error">{{ couponError }}</p>
                      }
                    }
                  </div>

                  <div class="divider"></div>

                  <!-- Summary Details -->
                  <div class="summary-row">
                    <span>Subtotal ({{ cartService.itemCount() }} items)</span>
                    <span>\${{ cartService.cart()?.subtotal?.toFixed(2) }}</span>
                  </div>
                  @if (cartService.cart()?.discount && cartService.cart()!.discount > 0) {
                    <div class="summary-row discount">
                      <span>Discount</span>
                      <span>-\${{ cartService.cart()?.discount?.toFixed(2) }}</span>
                    </div>
                  }
                  <div class="summary-row">
                    <span>Shipping</span>
                    <span>
                      @if (cartService.cart()?.shipping === 0) {
                        <span class="free-shipping">FREE</span>
                      } @else {
                        \${{ cartService.cart()?.shipping?.toFixed(2) }}
                      }
                    </span>
                  </div>
                  <div class="summary-row">
                    <span>Tax</span>
                    <span>\${{ cartService.cart()?.tax?.toFixed(2) }}</span>
                  </div>

                  @if (cartService.cart()?.amountToFreeShipping && cartService.cart()!.amountToFreeShipping > 0) {
                    <div class="free-shipping-progress">
                      <p>Add \${{ cartService.cart()?.amountToFreeShipping?.toFixed(2) }} more for free shipping!</p>
                      <div class="progress-bar">
                        <div class="progress-fill" [style.width.%]="getFreeShippingProgress()"></div>
                      </div>
                    </div>
                  }

                  <div class="divider"></div>

                  <div class="summary-row total">
                    <span>Total</span>
                    <span>\${{ cartService.cart()?.total?.toFixed(2) }}</span>
                  </div>

                  <a routerLink="/checkout" class="btn btn-primary btn-lg checkout-btn">
                    Proceed to Checkout
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </a>

                  <p class="secure-checkout">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    Secure checkout with SSL encryption
                  </p>
                </div>
              </div>
            </aside>
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    .cart-page {
      padding: var(--space-xl) 0 var(--space-3xl);
      min-height: 60vh;
    }

    .cart-page h1 {
      font-size: 2rem;
      margin-bottom: var(--space-xl);
    }

    .empty-cart {
      text-align: center;
      padding: var(--space-3xl);
    }

    .empty-icon {
      font-size: 5rem;
      margin-bottom: var(--space-lg);
    }

    .empty-cart h2 {
      font-size: 1.5rem;
      margin-bottom: var(--space-sm);
    }

    .empty-cart p {
      margin-bottom: var(--space-xl);
    }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: var(--space-xl);
      align-items: start;
    }

    @media (max-width: 1024px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto auto auto;
      gap: var(--space-lg);
      align-items: center;
      padding: var(--space-lg);
    }

    @media (max-width: 768px) {
      .cart-item {
        grid-template-columns: 80px 1fr;
        gap: var(--space-md);
      }

      .item-quantity,
      .item-subtotal {
        grid-column: 2;
      }

      .remove-btn {
        position: absolute;
        top: var(--space-sm);
        right: var(--space-sm);
      }

      .cart-item {
        position: relative;
      }
    }

    .item-image {
      width: 100px;
      height: 100px;
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-name {
      font-weight: 600;
      color: var(--gray-900);
      text-decoration: none;
      display: block;
      margin-bottom: var(--space-xs);
    }

    .item-name:hover {
      color: var(--primary-600);
    }

    .item-price {
      font-size: 0.875rem;
      color: var(--gray-500);
    }

    .item-quantity {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .qty-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--gray-100);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: 600;
      transition: all var(--transition-fast);
    }

    .qty-btn:hover:not(:disabled) {
      background: var(--gray-200);
    }

    .qty-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .qty-input {
      width: 50px;
      text-align: center;
      padding: 0.5rem;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      font-weight: 600;
    }

    .qty-input::-webkit-inner-spin-button,
    .qty-input::-webkit-outer-spin-button {
      -webkit-appearance: none;
    }

    .item-subtotal {
      text-align: right;
    }

    .subtotal-label {
      display: block;
      font-size: 0.75rem;
      color: var(--gray-500);
      margin-bottom: var(--space-xs);
    }

    .subtotal-value {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--gray-900);
    }

    .remove-btn {
      background: none;
      border: none;
      color: var(--gray-400);
      cursor: pointer;
      padding: var(--space-sm);
      border-radius: var(--radius-full);
      transition: all var(--transition-fast);
    }

    .remove-btn:hover {
      background: var(--error-500);
      color: white;
    }

    .summary-card {
      position: sticky;
      top: 90px;
    }

    .summary-card .card-header h2 {
      font-size: 1.25rem;
    }

    .coupon-section {
      margin-bottom: var(--space-md);
    }

    .coupon-form {
      display: flex;
      gap: var(--space-sm);
    }

    .coupon-form .form-input {
      flex: 1;
      padding: 0.625rem 1rem;
    }

    .applied-coupon {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-sm) var(--space-md);
      background: var(--success-500);
      color: white;
      border-radius: var(--radius-md);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: var(--space-sm) 0;
      font-size: 0.9375rem;
    }

    .summary-row span:first-child {
      color: var(--gray-600);
    }

    .summary-row.discount span:last-child {
      color: var(--success-600);
    }

    .summary-row.total {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .summary-row.total span {
      color: var(--gray-900);
    }

    .free-shipping {
      color: var(--success-600);
      font-weight: 600;
    }

    .free-shipping-progress {
      padding: var(--space-md);
      background: var(--primary-50);
      border-radius: var(--radius-md);
      margin-top: var(--space-md);
    }

    .free-shipping-progress p {
      font-size: 0.8125rem;
      color: var(--primary-700);
      margin-bottom: var(--space-sm);
    }

    .progress-bar {
      height: 6px;
      background: var(--primary-200);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--gradient-primary);
      border-radius: var(--radius-full);
      transition: width var(--transition-normal);
    }

    .checkout-btn {
      width: 100%;
      margin-top: var(--space-lg);
    }

    .secure-checkout {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      margin-top: var(--space-md);
      font-size: 0.8125rem;
      color: var(--gray-500);
    }
  `]
})
export class CartComponent {
    cartService = inject(CartService);

    couponCode = '';
    couponError = '';
    applyingCoupon = false;

    updateQuantity(item: CartItem, quantity: number): void {
        if (quantity < 1 || quantity > item.maxQuantity) return;
        this.cartService.updateQuantity(item._id, quantity).subscribe();
    }

    onQuantityChange(item: CartItem, event: Event): void {
        const input = event.target as HTMLInputElement;
        const quantity = parseInt(input.value, 10);
        if (!isNaN(quantity) && quantity >= 1 && quantity <= item.maxQuantity) {
            this.cartService.updateQuantity(item._id, quantity).subscribe();
        }
    }

    removeItem(itemId: string): void {
        this.cartService.removeItem(itemId).subscribe();
    }

    clearCart(): void {
        if (confirm('Are you sure you want to clear your cart?')) {
            this.cartService.clearCart().subscribe();
        }
    }

    applyCoupon(): void {
        if (!this.couponCode.trim()) return;

        this.applyingCoupon = true;
        this.couponError = '';

        this.cartService.applyCoupon(this.couponCode.trim()).subscribe({
            next: () => {
                this.applyingCoupon = false;
                this.couponCode = '';
            },
            error: (err) => {
                this.applyingCoupon = false;
                this.couponError = err.error?.message || 'Failed to apply coupon';
            }
        });
    }

    removeCoupon(): void {
        this.cartService.removeCoupon().subscribe();
    }

    getFreeShippingProgress(): number {
        const cart = this.cartService.cart();
        if (!cart) return 0;
        const threshold = cart.freeShippingThreshold || 50;
        const progress = ((cart.subtotal - cart.discount) / threshold) * 100;
        return Math.min(progress, 100);
    }
}
