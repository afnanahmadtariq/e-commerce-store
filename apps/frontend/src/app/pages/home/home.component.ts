import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductService, Product, Category } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <span class="hero-badge">✨ Premium E-Commerce Experience</span>
          <h1>Discover Your <span class="gradient-text">Perfect Style</span></h1>
          <p>Shop the latest trends with amazing deals. Quality products, unbeatable prices, and lightning-fast delivery worldwide.</p>
          <div class="hero-actions">
            <a routerLink="/products" class="btn btn-primary btn-lg btn-glow">
              Shop Now
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </a>
            <a routerLink="/categories" class="btn btn-glass btn-lg">Browse Categories</a>
          </div>
          <div class="hero-stats">
            <div class="stat-card">
              <div class="stat-value">
                @if (statsLoading) {
                  <span class="stat-loading"></span>
                } @else {
                  <strong>{{ stats.totalOrders }}</strong>
                }
              </div>
              <span class="stat-label">Orders Completed</span>
            </div>
            <div class="stat-card">
              <div class="stat-value">
                @if (statsLoading) {
                  <span class="stat-loading"></span>
                } @else {
                  <strong>{{ stats.totalProducts }}</strong>
                }
              </div>
              <span class="stat-label">Products Available</span>
            </div>
            <div class="stat-card">
              <div class="stat-value">
                <strong>{{ stats.avgRating }}</strong>
              </div>
              <span class="stat-label">Average Rating</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-image-container">
            <div class="hero-image">
              <img src="/images/hero-fashion.png" alt="Fashion collection" />
              <div class="hero-overlay"></div>
            </div>
            <div class="floating-card card-1">
              <span class="icon">🚀</span>
              <div>
                <strong>Fast Delivery</strong>
                <span>2-3 Business Days</span>
              </div>
            </div>
            <div class="floating-card card-2">
              <span class="icon">🛡️</span>
              <div>
                <strong>Secure Checkout</strong>
                <span>256-bit SSL</span>
              </div>
            </div>
            <div class="floating-card card-3">
              <span class="icon">⭐</span>
              <div>
                <strong>Top Rated</strong>
                <span>{{ stats.avgRating }} Stars</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Badges -->
    <section class="trust-section">
      <div class="container">
        <div class="trust-badges">
          <div class="trust-badge">
            <span class="trust-icon">🔒</span>
            <span>Secure Payment</span>
          </div>
          <div class="trust-badge">
            <span class="trust-icon">🚚</span>
            <span>Free Shipping $50+</span>
          </div>
          <div class="trust-badge">
            <span class="trust-icon">↩️</span>
            <span>30-Day Returns</span>
          </div>
          <div class="trust-badge">
            <span class="trust-icon">💬</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="section categories-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Shop by Category</h2>
          <p class="section-subtitle">Explore our curated collections</p>
        </div>
        <div class="categories-grid">
          @for (category of categories; track category._id) {
            <a [routerLink]="['/products']" [queryParams]="{category: category.slug}" class="category-card">
              <div class="category-icon">
                {{ getCategoryIcon(category.slug) }}
              </div>
              <h3>{{ category.name }}</h3>
              <span>{{ category.productCount || 0 }} Products</span>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="section featured-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Featured Products</h2>
          <p class="section-subtitle">Handpicked just for you</p>
        </div>
        @if (loading) {
          <div class="grid grid-cols-4">
            @for (i of [1,2,3,4]; track i) {
              <div class="card">
                <div class="skeleton" style="height: 200px;"></div>
                <div class="card-body">
                  <div class="skeleton" style="height: 20px; width: 80%; margin-bottom: 8px;"></div>
                  <div class="skeleton" style="height: 16px; width: 50%;"></div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-4">
            @for (product of featuredProducts; track product._id) {
              <div class="product-card card">
                <a [routerLink]="['/products', product.slug]" class="product-image">
                  <img [src]="product.images[0]?.url || 'https://via.placeholder.com/300'" [alt]="product.name" />
                  @if (product.compareAtPrice && product.compareAtPrice > product.price) {
                    <span class="product-badge">Sale</span>
                  }
                </a>
                <div class="card-body">
                  <span class="product-category">{{ product.category }}</span>
                  <h3 class="product-name">
                    <a [routerLink]="['/products', product.slug]">{{ product.name }}</a>
                  </h3>
                  <div class="product-rating">
                    <span class="stars">
                      @for (star of [1,2,3,4,5]; track star) {
                        <span [class.filled]="star <= product.ratings.average">★</span>
                      }
                    </span>
                    <span class="count">({{ product.ratings.count }})</span>
                  </div>
                  <div class="product-footer">
                    <div class="product-price">
                      <span class="price">\${{ product.price.toFixed(2) }}</span>
                      @if (product.compareAtPrice && product.compareAtPrice > product.price) {
                        <span class="price-original">\${{ product.compareAtPrice.toFixed(2) }}</span>
                      }
                    </div>
                    <button class="btn btn-icon btn-primary" (click)="addToCart(product)" [disabled]="addingToCart === product._id">
                      @if (addingToCart === product._id) {
                        <div class="spinner spinner-sm"></div>
                      } @else {
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                      }
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
        <div class="text-center mt-xl">
          <a routerLink="/products" class="btn btn-outline btn-lg">View All Products</a>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="section features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🚚</div>
            <h3>Free Shipping</h3>
            <p>Free shipping on all orders over $50</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Secure Payment</h3>
            <p>100% secure payment processing</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">↩️</div>
            <h3>Easy Returns</h3>
            <p>30-day hassle-free returns</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>24/7 Support</h3>
            <p>Round the clock customer support</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="section newsletter-section">
      <div class="container">
        <div class="newsletter-content">
          <h2>Stay in the Loop</h2>
          <p>Subscribe to get exclusive offers, new arrivals, and more!</p>
          <form class="newsletter-form" (submit)="$event.preventDefault()">
            <input type="email" placeholder="Enter your email" class="form-input" />
            <button type="submit" class="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  `,
    styles: [`
    /* Hero Section */
    .hero {
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%);
      padding: var(--space-3xl) 0;
      overflow: hidden;
    }

    .hero .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3xl);
      align-items: center;
    }

    @media (max-width: 1024px) {
      .hero .container {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }

    .hero-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: white;
      border-radius: var(--radius-full);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--primary-700);
      margin-bottom: var(--space-lg);
      box-shadow: var(--shadow-sm);
    }

    .hero h1 {
      font-size: 3.5rem;
      line-height: 1.1;
      margin-bottom: var(--space-lg);
    }

    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2.5rem;
      }
    }

    .gradient-text {
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero p {
      font-size: 1.125rem;
      color: var(--gray-600);
      margin-bottom: var(--space-xl);
      max-width: 500px;
    }

    @media (max-width: 1024px) {
      .hero p {
        margin: 0 auto var(--space-xl);
      }
    }

    .hero-actions {
      display: flex;
      gap: var(--space-md);
      margin-bottom: var(--space-2xl);
    }

    @media (max-width: 1024px) {
      .hero-actions {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .hero-actions {
        flex-direction: column;
      }
    }

    .hero-stats {
      display: flex;
      gap: var(--space-2xl);
    }

    @media (max-width: 1024px) {
      .hero-stats {
        justify-content: center;
      }
    }

    .stat {
      text-align: left;
    }

    @media (max-width: 1024px) {
      .stat {
        text-align: center;
      }
    }

    .stat strong {
      display: block;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--gray-900);
    }

    .stat span {
      font-size: 0.875rem;
      color: var(--gray-500);
    }

    .hero-visual {
      position: relative;
    }

    @media (max-width: 1024px) {
      .hero-visual {
        display: none;
      }
    }

    .hero-image-container {
      position: relative;
    }

    .hero-image {
      position: relative;
      border-radius: var(--radius-2xl);
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .hero-image img {
      width: 100%;
      height: 500px;
      object-fit: cover;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.2), transparent);
    }

    .floating-card {
      position: absolute;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-md) var(--space-lg);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: var(--radius-xl);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      animation: float 4s ease-in-out infinite;
      border: 1px solid rgba(255, 255, 255, 0.5);
    }

    .floating-card .icon {
      font-size: 1.75rem;
    }

    .floating-card strong {
      display: block;
      font-size: 0.9rem;
      color: var(--gray-900);
      font-weight: 700;
    }

    .floating-card span {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .card-1 {
      top: 15%;
      left: -30px;
    }

    .card-2 {
      bottom: 35%;
      right: -30px;
      animation-delay: 1.5s;
    }

    .card-3 {
      bottom: 10%;
      left: 20%;
      animation-delay: 3s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-12px) rotate(1deg); }
    }

    /* Trust Badges Section */
    .trust-section {
      background: white;
      padding: var(--space-lg) 0;
      border-bottom: 1px solid var(--gray-100);
    }

    .trust-badges {
      display: flex;
      justify-content: center;
      gap: var(--space-3xl);
      flex-wrap: wrap;
    }

    .trust-badge {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-size: 0.9rem;
      color: var(--gray-600);
      font-weight: 500;
    }

    .trust-icon {
      font-size: 1.25rem;
    }

    /* Stat Cards */
    .stat-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border-radius: var(--radius-xl);
      padding: var(--space-lg);
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      min-width: 120px;
    }

    .stat-value {
      margin-bottom: var(--space-xs);
    }

    .stat-value strong {
      font-size: 2rem;
      font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--gray-500);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-loading {
      display: inline-block;
      width: 60px;
      height: 32px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-md);
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* Glowing Button */
    .btn-glow {
      position: relative;
      overflow: hidden;
    }

    .btn-glow::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: shine 3s infinite;
    }

    @keyframes shine {
      0% { left: -100%; }
      50%, 100% { left: 100%; }
    }

    /* Glass Button */
    .btn-glass {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      color: var(--gray-700);
      font-weight: 600;
    }

    .btn-glass:hover {
      background: white;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    /* Categories Section */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: var(--space-lg);
    }

    @media (max-width: 1024px) {
      .categories-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 640px) {
      .categories-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .category-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-xl);
      background: white;
      border-radius: var(--radius-xl);
      text-decoration: none;
      border: 1px solid var(--gray-100);
      transition: all var(--transition-normal);
    }

    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary-200);
    }

    .category-icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-50);
      border-radius: var(--radius-xl);
      font-size: 2rem;
      margin-bottom: var(--space-md);
    }

    .category-card h3 {
      font-size: 1rem;
      color: var(--gray-900);
      margin-bottom: var(--space-xs);
    }

    .category-card span {
      font-size: 0.8125rem;
      color: var(--gray-500);
    }

    /* Featured Products */
    .featured-section {
      background: var(--gray-50);
    }

    .product-card {
      position: relative;
    }

    .product-card .product-image {
      display: block;
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
    }

    .product-card .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-normal);
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .product-badge {
      position: absolute;
      top: var(--space-sm);
      left: var(--space-sm);
      padding: 0.25rem 0.75rem;
      background: var(--error-500);
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: var(--radius-full);
    }

    .product-category {
      font-size: 0.75rem;
      color: var(--primary-600);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .product-name {
      font-size: 1rem;
      font-weight: 600;
      margin: var(--space-xs) 0;
      line-height: 1.4;
    }

    .product-name a {
      color: var(--gray-900);
      text-decoration: none;
    }

    .product-name a:hover {
      color: var(--primary-600);
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      margin-bottom: var(--space-md);
    }

    .stars {
      color: var(--gray-300);
    }

    .stars .filled {
      color: #fbbf24;
    }

    .stars span {
      font-size: 0.875rem;
    }

    .count {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .product-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .product-price {
      display: flex;
      align-items: baseline;
      gap: var(--space-sm);
    }

    .product-price .price {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--gray-900);
    }

    .product-price .price-original {
      font-size: 0.875rem;
    }

    /* Features Section */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-lg);
    }

    @media (max-width: 1024px) {
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .features-grid {
        grid-template-columns: 1fr;
      }
    }

    .feature-card {
      text-align: center;
      padding: var(--space-xl);
      background: white;
      border-radius: var(--radius-xl);
      border: 1px solid var(--gray-100);
    }

    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: var(--space-md);
    }

    .feature-card h3 {
      font-size: 1.125rem;
      margin-bottom: var(--space-sm);
    }

    .feature-card p {
      font-size: 0.875rem;
      color: var(--gray-500);
    }

    /* Newsletter Section */
    .newsletter-section {
      background: var(--gradient-primary);
      color: white;
    }

    .newsletter-content {
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .newsletter-content h2 {
      color: white;
      font-size: 2rem;
      margin-bottom: var(--space-sm);
    }

    .newsletter-content p {
      color: rgba(255, 255, 255, 0.85);
      margin-bottom: var(--space-xl);
    }

    .newsletter-form {
      display: flex;
      gap: var(--space-md);
      max-width: 450px;
      margin: 0 auto;
    }

    @media (max-width: 480px) {
      .newsletter-form {
        flex-direction: column;
      }
    }

    .newsletter-form .form-input {
      flex: 1;
      border-radius: var(--radius-full);
    }

    .newsletter-form .btn {
      border-radius: var(--radius-full);
      background: white;
      color: var(--primary-700);
    }

    .newsletter-form .btn:hover {
      background: var(--gray-100);
    }
  `]
})
export class HomeComponent implements OnInit {
    productService = inject(ProductService);
    cartService = inject(CartService);
    private http = inject(HttpClient);

    featuredProducts: Product[] = [];
    categories: Category[] = [];
    loading = true;
    addingToCart: string | null = null;
    statsLoading = true;
    
    // Real stats from database
    stats = {
        totalOrders: 0,
        totalProducts: 0,
        avgRating: '4.8★'
    };

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.productService.getFeaturedProducts(8).subscribe({
            next: (products) => {
                this.featuredProducts = products;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });

        this.productService.getCategories().subscribe({
            next: (categories) => {
                this.categories = categories.slice(0, 5);
            }
        });
        
        // Load real stats
        this.loadStats();
    }
    
    private loadStats(): void {
        let productsLoaded = false;
        let ordersLoaded = false;
        
        const checkComplete = () => {
            if (productsLoaded && ordersLoaded) {
                this.statsLoading = false;
            }
        };
        
        // Get total products count
        this.productService.getProducts({ limit: 1 }).subscribe({
            next: (response) => {
                this.stats.totalProducts = response.total;
                productsLoaded = true;
                checkComplete();
            },
            error: () => {
                productsLoaded = true;
                checkComplete();
            }
        });
        
        // Get order statistics
        this.http.get<{ success: boolean; data: { statistics: { totalOrders: number; deliveredOrders: number } } }>(
            `${environment.apiUrl}/orders/statistics`
        ).subscribe({
            next: (response) => {
                if (response.success && response.data.statistics) {
                    this.stats.totalOrders = response.data.statistics.deliveredOrders || response.data.statistics.totalOrders || 0;
                }
                ordersLoaded = true;
                checkComplete();
            },
            error: () => {
                ordersLoaded = true;
                checkComplete();
            }
        });
    }

    getCategoryIcon(slug: string): string {
        const icons: Record<string, string> = {
            'electronics': '📱',
            'clothing': '👕',
            'home-garden': '🏠',
            'sports': '⚽',
            'books': '📚',
            'beauty': '💄',
            'toys': '🧸',
            'food': '🍔',
        };
        return icons[slug] || '📦';
    }

    addToCart(product: Product): void {
        this.addingToCart = product._id;
        this.cartService.addItem({
            productId: product._id,
            name: product.name,
            slug: product.slug,
            image: product.images[0]?.url || '',
            price: product.price,
            originalPrice: product.compareAtPrice,
            quantity: 1,
            maxQuantity: product.inventory.quantity
        }).subscribe({
            next: () => {
                this.addingToCart = null;
            },
            error: () => {
                this.addingToCart = null;
            }
        });
    }
}
