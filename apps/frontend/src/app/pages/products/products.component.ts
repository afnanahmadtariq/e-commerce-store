import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, Category, ProductFilter } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div class="products-page">
      <div class="container">
        <div class="page-header">
          <h1>{{ pageTitle }}</h1>
          <p>{{ productService.totalProducts() }} products found</p>
        </div>

        <div class="products-layout">
          <!-- Filters Sidebar -->
          <aside class="filters-sidebar">
            <div class="filter-section">
              <h3>Categories</h3>
              <div class="filter-options">
                <label class="filter-option">
                  <input type="radio" name="category" [value]="''" [(ngModel)]="filters.category" (change)="applyFilters()" />
                  <span>All Categories</span>
                </label>
                @for (category of categories; track category._id) {
                  <label class="filter-option">
                    <input type="radio" name="category" [value]="category.slug" [(ngModel)]="filters.category" (change)="applyFilters()" />
                    <span>{{ category.name }}</span>
                  </label>
                }
              </div>
            </div>

            <div class="filter-section">
              <h3>Price Range</h3>
              <div class="price-inputs">
                <input type="number" placeholder="Min" [(ngModel)]="filters.minPrice" (change)="applyFilters()" class="form-input" />
                <span>-</span>
                <input type="number" placeholder="Max" [(ngModel)]="filters.maxPrice" (change)="applyFilters()" class="form-input" />
              </div>
            </div>

            <div class="filter-section">
              <h3>Availability</h3>
              <label class="filter-option checkbox">
                <input type="checkbox" [(ngModel)]="filters.inStock" (change)="applyFilters()" />
                <span>In Stock Only</span>
              </label>
            </div>

            <button class="btn btn-secondary" (click)="clearFilters()">Clear Filters</button>
          </aside>

          <!-- Products Grid -->
          <div class="products-main">
            <!-- Sort Bar -->
            <div class="sort-bar">
              <span>Sort by:</span>
              <select [(ngModel)]="sortOption" (change)="onSortChange()" class="form-input">
                <option value="createdAt-desc">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="ratings-desc">Top Rated</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
            </div>

            @if (productService.loading()) {
              <div class="grid grid-cols-3">
                @for (i of [1,2,3,4,5,6]; track i) {
                  <div class="card">
                    <div class="skeleton" style="height: 200px;"></div>
                    <div class="card-body">
                      <div class="skeleton" style="height: 20px; width: 80%; margin-bottom: 8px;"></div>
                      <div class="skeleton" style="height: 16px; width: 50%;"></div>
                    </div>
                  </div>
                }
              </div>
            } @else if (products.length === 0) {
              <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button class="btn btn-primary" (click)="clearFilters()">Clear Filters</button>
              </div>
            } @else {
              <div class="grid grid-cols-3">
                @for (product of products; track product._id) {
                  <div class="product-card card">
                    <a [routerLink]="['/products', product.slug]" class="product-image">
                      <img [src]="product.images[0]?.url || 'https://via.placeholder.com/300'" [alt]="product.name" />
                      @if (product.compareAtPrice && product.compareAtPrice > product.price) {
                        <span class="product-badge">Sale</span>
                      }
                      @if (product.inventory.quantity <= 0) {
                        <span class="product-badge out-of-stock">Out of Stock</span>
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
                        <button 
                          class="btn btn-icon btn-primary" 
                          (click)="addToCart(product)" 
                          [disabled]="addingToCart === product._id || product.inventory.quantity <= 0"
                        >
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

              <!-- Pagination -->
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
      </div>
    </div>
  `,
    styles: [`
    .products-page {
      padding: var(--space-xl) 0 var(--space-3xl);
    }

    .page-header {
      margin-bottom: var(--space-xl);
    }

    .page-header h1 {
      font-size: 2rem;
      margin-bottom: var(--space-xs);
    }

    .page-header p {
      color: var(--gray-500);
    }

    .products-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: var(--space-xl);
    }

    @media (max-width: 1024px) {
      .products-layout {
        grid-template-columns: 1fr;
      }

      .filters-sidebar {
        display: none;
      }
    }

    .filters-sidebar {
      background: white;
      padding: var(--space-lg);
      border-radius: var(--radius-xl);
      height: fit-content;
      position: sticky;
      top: 90px;
      border: 1px solid var(--gray-100);
    }

    .filter-section {
      margin-bottom: var(--space-xl);
    }

    .filter-section h3 {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--gray-700);
      margin-bottom: var(--space-md);
    }

    .filter-options {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .filter-option {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      cursor: pointer;
      font-size: 0.875rem;
      color: var(--gray-600);
    }

    .filter-option:hover {
      color: var(--gray-900);
    }

    .filter-option input[type="radio"],
    .filter-option input[type="checkbox"] {
      accent-color: var(--primary-600);
    }

    .price-inputs {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .price-inputs .form-input {
      width: 80px;
      padding: 0.5rem;
      font-size: 0.875rem;
    }

    .sort-bar {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
      padding: var(--space-md);
      background: white;
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-100);
    }

    .sort-bar span {
      font-size: 0.875rem;
      color: var(--gray-600);
    }

    .sort-bar select {
      width: auto;
      padding: 0.5rem 2rem 0.5rem 0.75rem;
      font-size: 0.875rem;
    }

    .empty-state {
      text-align: center;
      padding: var(--space-3xl);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: var(--space-lg);
    }

    .empty-state h3 {
      font-size: 1.25rem;
      margin-bottom: var(--space-sm);
    }

    .empty-state p {
      margin-bottom: var(--space-lg);
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

    .product-badge.out-of-stock {
      background: var(--gray-700);
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

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-lg);
      margin-top: var(--space-xl);
      padding-top: var(--space-xl);
      border-top: 1px solid var(--gray-200);
    }

    .page-info {
      font-size: 0.875rem;
      color: var(--gray-600);
    }
  `]
})
export class ProductsComponent implements OnInit {
    productService = inject(ProductService);
    cartService = inject(CartService);
    route = inject(ActivatedRoute);

    products: Product[] = [];
    categories: Category[] = [];

    filters: ProductFilter = {
        page: 1,
        limit: 12
    };

    sortOption = 'createdAt-desc';
    currentPage = 1;
    totalPages = 1;
    pageTitle = 'All Products';
    addingToCart: string | null = null;

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['category']) {
                this.filters.category = params['category'];
                this.pageTitle = this.formatCategoryName(params['category']);
            }
            if (params['search']) {
                this.filters.search = params['search'];
                this.pageTitle = `Search: "${params['search']}"`;
            }
            this.loadProducts();
        });

        this.productService.getCategories().subscribe({
            next: (categories) => {
                this.categories = categories;
            }
        });
    }

    loadProducts(): void {
        this.productService.getProducts(this.filters).subscribe({
            next: (data) => {
                this.products = data.products;
                this.currentPage = data.page;
                this.totalPages = data.totalPages;
            }
        });
    }

    applyFilters(): void {
        this.filters.page = 1;
        this.loadProducts();
    }

    clearFilters(): void {
        this.filters = { page: 1, limit: 12 };
        this.sortOption = 'createdAt-desc';
        this.pageTitle = 'All Products';
        this.loadProducts();
    }

    onSortChange(): void {
        const [sortBy, sortOrder] = this.sortOption.split('-');
        this.filters.sortBy = sortBy as ProductFilter['sortBy'];
        this.filters.sortOrder = sortOrder as 'asc' | 'desc';
        this.loadProducts();
    }

    goToPage(page: number): void {
        this.filters.page = page;
        this.loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    formatCategoryName(slug: string): string {
        return slug.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
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
