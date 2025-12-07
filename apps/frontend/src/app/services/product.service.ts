import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;
    sku: string;
    price: number;
    compareAtPrice?: number;
    category: string;
    brand?: string;
    tags: string[];
    images: ProductImage[];
    variants: ProductVariant[];
    inventory: {
        quantity: number;
        reservedQuantity: number;
        lowStockThreshold: number;
        trackInventory: boolean;
    };
    ratings: {
        average: number;
        count: number;
    };
    isActive: boolean;
    isFeatured: boolean;
}

export interface ProductImage {
    url: string;
    alt: string;
    isPrimary: boolean;
    order: number;
}

export interface ProductVariant {
    name: string;
    sku: string;
    price: number;
    inventory: number;
    attributes: Record<string, string>;
}

export interface ProductFilter {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    search?: string;
    sortBy?: 'price' | 'name' | 'createdAt' | 'ratings';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    isFeatured?: boolean;
    inStock?: boolean;
}

export interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
    isActive: boolean;
    order: number;
    productCount: number;
    children?: Category[];
}

export interface ProductReview {
    _id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    title: string;
    content: string;
    isVerified: boolean;
    helpfulCount: number;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    products = signal<Product[]>([]);
    featuredProducts = signal<Product[]>([]);
    categories = signal<Category[]>([]);
    loading = signal(false);
    totalProducts = signal(0);

    private readonly http = inject(HttpClient);

    getProducts(filters: ProductFilter = {}): Observable<{ products: Product[]; total: number; page: number; totalPages: number }> {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        this.loading.set(true);
        return this.http.get<{ success: boolean; data: { products: Product[]; total: number; page: number; totalPages: number } }>(
            `${environment.apiUrl}/products?${params.toString()}`
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.products.set(response.data.products);
                    this.totalProducts.set(response.data.total);
                }
                this.loading.set(false);
            }),
            map(response => response.data)
        );
    }

    getProduct(id: string): Observable<Product> {
        return this.http.get<{ success: boolean; data: { product: Product } }>(
            `${environment.apiUrl}/products/${id}`
        ).pipe(
            map(response => response.data.product)
        );
    }

    getProductBySlug(slug: string): Observable<Product> {
        return this.http.get<{ success: boolean; data: { product: Product } }>(
            `${environment.apiUrl}/products/slug/${slug}`
        ).pipe(
            map(response => response.data.product)
        );
    }

    getFeaturedProducts(limit = 8): Observable<Product[]> {
        return this.http.get<{ success: boolean; data: { products: Product[] } }>(
            `${environment.apiUrl}/products/featured?limit=${limit}`
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.featuredProducts.set(response.data.products);
                }
            }),
            map(response => response.data.products)
        );
    }

    searchProducts(query: string, limit = 20): Observable<Product[]> {
        return this.http.get<{ success: boolean; data: { products: Product[] } }>(
            `${environment.apiUrl}/products/search?q=${encodeURIComponent(query)}&limit=${limit}`
        ).pipe(
            map(response => response.data.products)
        );
    }

    getCategories(): Observable<Category[]> {
        return this.http.get<{ success: boolean; data: { categories: Category[] } }>(
            `${environment.apiUrl}/categories`
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.categories.set(response.data.categories);
                }
            }),
            map(response => response.data.categories)
        );
    }

    getCategoryTree(): Observable<Category[]> {
        return this.http.get<{ success: boolean; data: { categories: Category[] } }>(
            `${environment.apiUrl}/categories/tree`
        ).pipe(
            map(response => response.data.categories)
        );
    }

    getProductReviews(productId: string, page = 1, limit = 10): Observable<{ reviews: ProductReview[]; total: number; averageRating: number }> {
        return this.http.get<{ success: boolean; data: { reviews: ProductReview[]; total: number; averageRating: number } }>(
            `${environment.apiUrl}/products/${productId}/reviews?page=${page}&limit=${limit}`
        ).pipe(
            map(response => response.data)
        );
    }

    createReview(productId: string, data: { rating: number; title: string; content: string }): Observable<ProductReview> {
        return this.http.post<{ success: boolean; data: { review: ProductReview } }>(
            `${environment.apiUrl}/products/${productId}/reviews`,
            data
        ).pipe(
            map(response => response.data.review)
        );
    }
}
