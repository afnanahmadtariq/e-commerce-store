import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
  children?: Category[];
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="categories-page">
      <div class="container">
        <div class="page-header">
          <h1>Categories</h1>
          <p>Browse our product categories</p>
        </div>

        @if (loading) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Loading categories...</p>
          </div>
        } @else if (error) {
          <div class="error">
            <p>{{ error }}</p>
            <button (click)="loadCategories()" class="retry-btn">Try Again</button>
          </div>
        } @else {
          <div class="categories-grid">
            @for (category of categories; track category._id) {
              <div class="category-card">
                <a [routerLink]="['/products']" [queryParams]="{ category: category.slug }" class="category-link">
                  @if (category.image) {
                    <div class="category-image">
                      <img [src]="category.image" [alt]="category.name" loading="lazy" />
                    </div>
                  } @else {
                    <div class="category-placeholder">
                      <span class="category-icon">📦</span>
                    </div>
                  }
                  <div class="category-content">
                    <h3>{{ category.name }}</h3>
                    @if (category.description) {
                      <p>{{ category.description }}</p>
                    }
                    @if (category.productCount !== undefined) {
                      <span class="product-count">{{ category.productCount }} products</span>
                    }
                  </div>
                </a>
              </div>
            }
          </div>

          @if (categories.length === 0) {
            <div class="empty-state">
              <span class="empty-icon">📂</span>
              <h3>No categories found</h3>
              <p>Check back later for new categories</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .categories-page {
      padding: 2rem 0;
      min-height: 60vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .page-header h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: #666;
      font-size: 1.1rem;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error {
      text-align: center;
      padding: 3rem;
      color: #dc2626;
    }

    .retry-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-size: 1rem;
      margin-top: 1rem;
      transition: background-color 0.2s;
    }

    .retry-btn:hover {
      background: #2563eb;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .category-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .category-link {
      display: block;
      text-decoration: none;
      color: inherit;
    }

    .category-image {
      height: 200px;
      overflow: hidden;
    }

    .category-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s;
    }

    .category-card:hover .category-image img {
      transform: scale(1.05);
    }

    .category-placeholder {
      height: 200px;
      background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .category-icon {
      font-size: 4rem;
      opacity: 0.6;
    }

    .category-content {
      padding: 1.5rem;
    }

    .category-content h3 {
      font-size: 1.25rem;
      color: #1f2937;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .category-content p {
      color: #6b7280;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .product-count {
      display: inline-block;
      background: #dbeafe;
      color: #1d4ed8;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6b7280;
    }

    .empty-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    @media (max-width: 768px) {
      .categories-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
      }

      .page-header h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class CategoriesComponent implements OnInit {
  private http = inject(HttpClient);

  categories: Category[] = [];
  loading = false;
  error = '';

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.error = '';

    this.http.get<{ success: boolean; data: { categories: Category[] } }>(
      `${environment.apiUrl}/categories`
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data.categories;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Failed to load categories. Please try again.';
        this.loading = false;
      }
    });
  }
}