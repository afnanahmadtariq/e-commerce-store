import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService, PaymentMethod } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div class="checkout-page">
      <div class="container">
        <h1>Checkout</h1>
        @if (cartService.isEmpty()) {
          <div class="empty-state">
            <h2>Your cart is empty</h2>
            <a routerLink="/products" class="btn btn-primary">Shop Now</a>
          </div>
        } @else {
          <div class="checkout-layout">
            <div class="checkout-form">
              <div class="card">
                <div class="card-header"><h2>Shipping Address</h2></div>
                <div class="card-body">
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label" for="firstName">First Name</label>
                      <input type="text" id="firstName" class="form-input" [(ngModel)]="shippingAddress.firstName" required />
                    </div>
                    <div class="form-group">
                      <label class="form-label" for="lastName">Last Name</label>
                      <input type="text" id="lastName" class="form-input" [(ngModel)]="shippingAddress.lastName" required />
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label" for="email">Email</label>
                      <input type="email" id="email" class="form-input" [(ngModel)]="shippingAddress.email" required />
                    </div>
                    <div class="form-group">
                      <label class="form-label" for="phone">Phone</label>
                      <input type="tel" id="phone" class="form-input" [(ngModel)]="shippingAddress.phone" required />
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="street">Street Address</label>
                    <input type="text" id="street" class="form-input" [(ngModel)]="shippingAddress.street" required />
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label" for="city">City</label>
                      <input type="text" id="city" class="form-input" [(ngModel)]="shippingAddress.city" required />
                    </div>
                    <div class="form-group">
                      <label class="form-label" for="state">State</label>
                      <input type="text" id="state" class="form-input" [(ngModel)]="shippingAddress.state" required />
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label" for="zipCode">ZIP Code</label>
                      <input type="text" id="zipCode" class="form-input" [(ngModel)]="shippingAddress.zipCode" required />
                    </div>
                    <div class="form-group">
                      <label class="form-label" for="country">Country</label>
                      <input type="text" id="country" class="form-input" [(ngModel)]="shippingAddress.country" required />
                    </div>
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="card-header"><h2>Payment Method</h2></div>
                <div class="card-body">
                  <div class="payment-options">
                    <label class="payment-option" [class.selected]="paymentMethod === 'credit_card'">
                      <input type="radio" name="payment" value="credit_card" [(ngModel)]="paymentMethod" />
                      <span>💳 Credit Card</span>
                    </label>
                    <label class="payment-option" [class.selected]="paymentMethod === 'cash_on_delivery'">
                      <input type="radio" name="payment" value="cash_on_delivery" [(ngModel)]="paymentMethod" />
                      <span>💵 Cash on Delivery</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <aside class="order-summary">
              <div class="card">
                <div class="card-header"><h2>Order Summary</h2></div>
                <div class="card-body">
                  <div class="summary-items">
                    @for (item of cartService.cart()?.items; track item._id) {
                      <div class="summary-item">
                        <span>{{ item.name }} × {{ item.quantity }}</span>
                        <span>\${{ item.subtotal.toFixed(2) }}</span>
                      </div>
                    }
                  </div>
                  <div class="divider"></div>
                  <div class="summary-row"><span>Subtotal</span><span>\${{ cartService.cart()?.subtotal?.toFixed(2) }}</span></div>
                  <div class="summary-row"><span>Shipping</span><span>\${{ cartService.cart()?.shipping?.toFixed(2) }}</span></div>
                  <div class="summary-row"><span>Tax</span><span>\${{ cartService.cart()?.tax?.toFixed(2) }}</span></div>
                  @if (cartService.cart()?.discount) {
                    <div class="summary-row discount"><span>Discount</span><span>-\${{ cartService.cart()?.discount?.toFixed(2) }}</span></div>
                  }
                  <div class="divider"></div>
                  <div class="summary-row total"><span>Total</span><span>\${{ cartService.cart()?.total?.toFixed(2) }}</span></div>
                  @if (error) {
                    <div class="alert alert-error">{{ error }}</div>
                  }
                  <button class="btn btn-primary btn-lg place-order-btn" (click)="placeOrder()" [disabled]="processing">
                    {{ processing ? 'Processing...' : 'Place Order' }}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    .checkout-page { padding: var(--space-xl) 0 var(--space-3xl); }
    .checkout-page h1 { font-size: 2rem; margin-bottom: var(--space-xl); }
    .empty-state { text-align: center; padding: var(--space-3xl); }
    .checkout-layout { display: grid; grid-template-columns: 1fr 400px; gap: var(--space-xl); align-items: start; }
    @media (max-width: 1024px) { .checkout-layout { grid-template-columns: 1fr; } }
    .checkout-form { display: flex; flex-direction: column; gap: var(--space-lg); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
    @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }
    .card-header h2 { font-size: 1.125rem; }
    .payment-options { display: flex; flex-direction: column; gap: var(--space-sm); }
    .payment-option { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); border: 2px solid var(--gray-200); border-radius: var(--radius-lg); cursor: pointer; }
    .payment-option.selected { border-color: var(--primary-500); background: var(--primary-50); }
    .payment-option input { display: none; }
    .summary-items { display: flex; flex-direction: column; gap: var(--space-sm); }
    .summary-item { display: flex; justify-content: space-between; font-size: 0.9375rem; color: var(--gray-600); }
    .summary-row { display: flex; justify-content: space-between; padding: var(--space-sm) 0; }
    .summary-row.discount span:last-child { color: var(--success-600); }
    .summary-row.total { font-size: 1.25rem; font-weight: 700; }
    .alert-error { margin-top: var(--space-md); padding: var(--space-md); background: rgba(239, 68, 68, 0.1); color: var(--error-600); border-radius: var(--radius-md); }
    .place-order-btn { width: 100%; margin-top: var(--space-lg); }
  `]
})
export class CheckoutComponent {
    cartService = inject(CartService);
    orderService = inject(OrderService);
    authService = inject(AuthService);
    router = inject(Router);

    shippingAddress = { firstName: '', lastName: '', email: '', phone: '', street: '', city: '', state: '', country: 'USA', zipCode: '', type: 'home' as const, isDefault: false };
    paymentMethod: PaymentMethod = 'credit_card';
    processing = false;
    error = '';

    constructor() {
        const user = this.authService.currentUser();
        if (user) {
            this.shippingAddress.firstName = user.firstName;
            this.shippingAddress.lastName = user.lastName;
            this.shippingAddress.email = user.email;
            this.shippingAddress.phone = user.phone || '';
        }
    }

    placeOrder(): void {
        const cart = this.cartService.cart();
        if (!cart || cart.items.length === 0) return;

        this.processing = true;
        this.error = '';

        const orderData = {
            items: cart.items.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                name: item.name,
                slug: item.slug,
                image: item.image,
                sku: 'SKU-' + item.productId.slice(-6),
                price: item.price,
                quantity: item.quantity
            })),
            shippingAddress: this.shippingAddress,
            paymentMethod: this.paymentMethod,
            subtotal: cart.subtotal,
            discount: cart.discount,
            couponCode: cart.coupon?.code,
            tax: cart.tax,
            shipping: cart.shipping
        };

        this.orderService.createOrder(orderData).subscribe({
            next: (order) => {
                this.cartService.clearCart().subscribe();
                this.router.navigate(['/orders', order._id]);
            },
            error: (err) => {
                this.processing = false;
                this.error = err.error?.message || 'Order failed. Please try again.';
            }
        });
    }
}
