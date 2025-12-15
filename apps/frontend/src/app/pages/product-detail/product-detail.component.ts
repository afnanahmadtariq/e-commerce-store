import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product-detail-page">
      <div class="container">
        @if (loading) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading product...</p>
          </div>
        } @else if (product) {
          <nav class="breadcrumb">
            <a routerLink="/">Home</a>
            <span>/</span>
            <a routerLink="/products">Products</a>
            <span>/</span>
            <span>{{ product.name }}</span>
          </nav>

          <div class="product-layout">
            <!-- Product Images -->
            <div class="product-gallery">
              <div class="main-image">
                <img [src]="selectedImage || product.images[0]?.url || 'https://via.placeholder.com/600'" [alt]="product.name" />
                @if (product.compareAtPrice && product.compareAtPrice > product.price) {
                  <span class="sale-badge">SALE</span>
                }
              </div>
              @if (product.images.length > 1) {
                <div class="thumbnail-list">
                  @for (image of product.images; track image.url) {
                    <button 
                      class="thumbnail" 
                      [class.active]="selectedImage === image.url"
                      (click)="selectedImage = image.url"
                    >
                      <img [src]="image.url" [alt]="image.alt || product.name" />
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Product Info -->
            <div class="product-info">
              <span class="product-category">{{ product.category }}</span>
              <h1>{{ product.name }}</h1>
              
              <div class="product-rating">
                <span class="stars">
                  @for (star of [1,2,3,4,5]; track star) {
                    <span [class.filled]="star <= product.ratings.average">★</span>
                  }
                </span>
                <span class="rating-text">{{ product.ratings.average.toFixed(1) }} ({{ product.ratings.count }} reviews)</span>
              </div>

              <div class="product-price">
                <span class="current-price">\${{ product.price.toFixed(2) }}</span>
                @if (product.compareAtPrice && product.compareAtPrice > product.price) {
                  <span class="original-price">\${{ product.compareAtPrice.toFixed(2) }}</span>
                  <span class="discount-badge">{{ getDiscountPercent() }}% OFF</span>
                }
              </div>

              <p class="product-description">{{ product.description }}</p>

              <!-- Stock Status -->
              <div class="stock-status" [class.in-stock]="product.inventory.quantity > 0" [class.out-of-stock]="product.inventory.quantity <= 0">
                @if (product.inventory.quantity > 0) {
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>In Stock ({{ product.inventory.quantity }} available)</span>
                } @else {
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span>Out of Stock</span>
                }
              </div>

              <!-- Quantity Selector -->
              <div class="quantity-section">
                <span class="quantity-label">Quantity:</span>
                <div class="quantity-controls">
                  <button (click)="decreaseQuantity()" [disabled]="quantity <= 1" aria-label="Decrease quantity">-</button>
                  <span>{{ quantity }}</span>
                  <button (click)="increaseQuantity()" [disabled]="quantity >= product.inventory.quantity" aria-label="Increase quantity">+</button>
                </div>
              </div>

              <!-- Add to Cart -->
              <div class="action-buttons">
                <button 
                  class="btn btn-primary btn-lg add-to-cart-btn" 
                  (click)="addToCart()"
                  [disabled]="addingToCart || product.inventory.quantity <= 0"
                >
                  @if (addingToCart) {
                    <div class="spinner spinner-sm"></div>
                    Adding...
                  } @else {
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    Add to Cart
                  }
                </button>
                <button class="btn btn-secondary btn-lg wishlist-btn">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </button>
              </div>

              <!-- Product Meta -->
              <div class="product-meta">
                <div class="meta-item">
                  <span class="meta-label">SKU:</span>
                  <span>{{ product.sku }}</span>
                </div>
                @if (product.brand) {
                  <div class="meta-item">
                    <span class="meta-label">Brand:</span>
                    <span>{{ product.brand }}</span>
                  </div>
                }
                @if (product.tags.length > 0) {
                  <div class="meta-item">
                    <span class="meta-label">Tags:</span>
                    <div class="tags">
                      @for (tag of product.tags; track tag) {
                        <span class="tag">{{ tag }}</span>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Features -->
              <div class="product-features">
                <div class="feature">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                  </svg>
                  <span>Free shipping over $50</span>
                </div>
                <div class="feature">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>30-day return policy</span>
                </div>
                <div class="feature">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        } @else {
          <div class="error-state">
            <h2>Product not found</h2>
            <p>The product you're looking for doesn't exist or has been removed.</p>
            <a routerLink="/products" class="btn btn-primary">Browse Products</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .product-detail-page {
      padding: var(--space-xl) 0 var(--space-3xl);
    }

    .loading-state,
    .error-state {
      text-align: center;
      padding: var(--space-3xl);
    }

    .loading-state p {
      margin-top: var(--space-md);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      margin-bottom: var(--space-xl);
      font-size: 0.875rem;
    }

    .breadcrumb a {
      color: var(--gray-500);
    }

    .breadcrumb a:hover {
      color: var(--primary-600);
    }

    .breadcrumb span:not(:last-child) {
      color: var(--gray-400);
    }

    .breadcrumb span:last-child {
      color: var(--gray-700);
    }

    .product-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3xl);
    }

    @media (max-width: 1024px) {
      .product-layout {
        grid-template-columns: 1fr;
        gap: var(--space-xl);
      }
    }

    .main-image {
      position: relative;
      border-radius: var(--radius-xl);
      overflow: hidden;
      background: var(--gray-100);
    }

    .main-image img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
    }

    .sale-badge {
      position: absolute;
      top: var(--space-md);
      left: var(--space-md);
      padding: 0.5rem 1rem;
      background: var(--error-500);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: var(--radius-full);
    }

    .thumbnail-list {
      display: flex;
      gap: var(--space-sm);
      margin-top: var(--space-md);
    }

    .thumbnail {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 2px solid transparent;
      cursor: pointer;
      background: none;
      padding: 0;
    }

    .thumbnail.active {
      border-color: var(--primary-500);
    }

    .thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-category {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary-600);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: var(--space-sm);
    }

    .product-info h1 {
      font-size: 2rem;
      margin-bottom: var(--space-md);
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
    }

    .stars {
      color: var(--gray-300);
      font-size: 1.25rem;
    }

    .stars .filled {
      color: #fbbf24;
    }

    .rating-text {
      color: var(--gray-600);
      font-size: 0.9375rem;
    }

    .product-price {
      display: flex;
      align-items: baseline;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
    }

    .current-price {
      font-size: 2rem;
      font-weight: 800;
      color: var(--gray-900);
    }

    .original-price {
      font-size: 1.25rem;
      color: var(--gray-400);
      text-decoration: line-through;
    }

    .discount-badge {
      padding: 0.25rem 0.5rem;
      background: var(--success-500);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: var(--radius-sm);
    }

    .product-description {
      color: var(--gray-600);
      line-height: 1.7;
      margin-bottom: var(--space-lg);
    }

    .stock-status {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-full);
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: var(--space-lg);
    }

    .stock-status.in-stock {
      background: rgba(34, 197, 94, 0.1);
      color: var(--success-600);
    }

    .stock-status.out-of-stock {
      background: rgba(239, 68, 68, 0.1);
      color: var(--error-600);
    }

    .quantity-section {
      display: flex;
      align-items: center;
      gap: var(--space-lg);
      margin-bottom: var(--space-xl);
    }

    .quantity-section label {
      font-weight: 500;
      color: var(--gray-700);
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      background: var(--gray-100);
      padding: 0.25rem;
      border-radius: var(--radius-lg);
    }

    .quantity-controls button {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 1.25rem;
      font-weight: 600;
      transition: all var(--transition-fast);
    }

    .quantity-controls button:hover:not(:disabled) {
      background: var(--primary-500);
      color: white;
    }

    .quantity-controls button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity-controls span {
      min-width: 40px;
      text-align: center;
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }

    .add-to-cart-btn {
      flex: 1;
    }

    .wishlist-btn {
      width: 54px;
      padding: 0;
    }

    .product-meta {
      padding: var(--space-lg);
      background: var(--gray-50);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-lg);
    }

    .meta-item {
      display: flex;
      gap: var(--space-sm);
      margin-bottom: var(--space-sm);
      font-size: 0.875rem;
    }

    .meta-item:last-child {
      margin-bottom: 0;
    }

    .meta-label {
      color: var(--gray-500);
    }

    .tags {
      display: flex;
      gap: var(--space-xs);
      flex-wrap: wrap;
    }

    .tag {
      padding: 0.125rem 0.5rem;
      background: var(--primary-100);
      color: var(--primary-700);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
    }

    .product-features {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .feature {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      color: var(--gray-600);
      font-size: 0.9375rem;
    }

    .feature svg {
      color: var(--primary-500);
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  route = inject(ActivatedRoute);

  product: Product | null = null;
  loading = true;
  selectedImage = '';
  quantity = 1;
  addingToCart = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loadProduct(params['slug']);
    });
  }

  loadProduct(slug: string): void {
    this.loading = true;
    this.productService.getProductBySlug(slug).subscribe({
      next: (product) => {
        this.product = product;
        this.selectedImage = product.images[0]?.url || '';
        this.loading = false;
      },
      error: () => {
        this.product = null;
        this.loading = false;
      }
    });
  }

  getDiscountPercent(): number {
    if (!this.product || !this.product.compareAtPrice) return 0;
    return Math.round((1 - this.product.price / this.product.compareAtPrice) * 100);
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.inventory.quantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product) return;

    this.addingToCart = true;
    this.cartService.addItem({
      productId: this.product._id,
      name: this.product.name,
      slug: this.product.slug,
      image: this.product.images[0]?.url || 'assets/placeholder.jpg',
      price: this.product.price,
      originalPrice: this.product.compareAtPrice,
      quantity: this.quantity,
      maxQuantity: this.product.inventory.quantity
    }).subscribe({
      next: () => {
        this.addingToCart = false;
        console.log('✅ Item added to cart successfully');
        alert('Item added to cart!');
      },
      error: (err) => {
        this.addingToCart = false;
        console.error('❌ Failed to add item to cart:', err);
        alert(`Failed to add item to cart: ${err.error?.message || err.message || 'Unknown error'}`);
      }
    });
  }
}
