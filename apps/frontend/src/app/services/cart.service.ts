import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CartItem {
    _id: string;
    productId: string;
    variantId?: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    originalPrice: number;
    quantity: number;
    maxQuantity: number;
    subtotal: number;
}

export interface Cart {
    id: string;
    items: CartItem[];
    itemCount: number;
    coupon?: {
        code: string;
        discountType: 'percentage' | 'fixed';
        discountValue: number;
        discountAmount: number;
    };
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
    freeShippingThreshold: number;
    amountToFreeShipping: number;
}

export interface AddToCartRequest {
    productId: string;
    variantId?: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    maxQuantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly SESSION_KEY = 'cart_session_id';
    private readonly platformId = inject(PLATFORM_ID);

    cart = signal<Cart | null>(null);
    loading = signal(false);

    itemCount = computed(() => this.cart()?.itemCount || 0);
    total = computed(() => this.cart()?.total || 0);
    isEmpty = computed(() => this.itemCount() === 0);

    private readonly http = inject(HttpClient);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.initSession();
            this.loadCart();
        }
    }

    private initSession(): void {
        if (!this.getSessionId()) {
            const sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
            if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem(this.SESSION_KEY, sessionId);
            }
        }
    }

    getSessionId(): string {
        if (!isPlatformBrowser(this.platformId)) {
            return '';
        }
        return localStorage.getItem(this.SESSION_KEY) || '';
    }

    private getHeaders(): { [key: string]: string } {
        return {
            'X-Session-ID': this.getSessionId()
        };
    }

    loadCart(): void {
        this.loading.set(true);
        this.http.get<{ success: boolean; data: { cart: Cart } }>(
            `${environment.apiUrl}/cart`
        ).subscribe({
            next: (response) => {
                if (response.success) {
                    this.cart.set(response.data.cart);
                }
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    addItem(item: AddToCartRequest): Observable<Cart> {
        this.loading.set(true);
        return this.http.post<{ success: boolean; data: { cart: Cart } }>(
            `${environment.apiUrl}/cart/items`,
            item
        ).pipe(
            map(response => response.data.cart),
            tap(cart => {
                this.cart.set(cart);
                this.loading.set(false);
            }),
            catchError(error => {
                console.error('Add to cart error:', error);
                this.loading.set(false);
                throw error;
            })
        );
    }

    updateQuantity(itemId: string, quantity: number): Observable<Cart> {
        this.loading.set(true);
        return this.http.put<{ success: boolean; data: { cart: Cart } }>(
            `${environment.apiUrl}/cart/items/${itemId}`,
            { quantity },
            { headers: this.getHeaders() }
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.cart.set(response.data.cart);
                }
                this.loading.set(false);
            }),
            map(response => response.data.cart)
        );
    }

    removeItem(itemId: string): Observable<Cart> {
        this.loading.set(true);
        return this.http.delete<{ success: boolean; data: { cart: Cart } }>(
            `${environment.apiUrl}/cart/items/${itemId}`,
            { headers: this.getHeaders() }
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.cart.set(response.data.cart);
                }
                this.loading.set(false);
            }),
            map(response => response.data.cart)
        );
    }

    clearCart(): Observable<Cart> {
        this.loading.set(true);
        return this.http.delete<{ success: boolean; data: { cart: Cart } }>(
            `${environment.apiUrl}/cart/clear`,
            { headers: this.getHeaders() }
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.cart.set(response.data.cart);
                }
                this.loading.set(false);
            }),
            map(response => response.data.cart)
        );
    }

    applyCoupon(code: string): Observable<Cart> {
        this.loading.set(true);
        return this.http.post<{ success: boolean; data: { cart: Cart }; message: string }>(
            `${environment.apiUrl}/cart/coupon`,
            { code },
            { headers: this.getHeaders() }
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.cart.set(response.data.cart);
                }
                this.loading.set(false);
            }),
            map(response => response.data.cart)
        );
    }

    removeCoupon(): Observable<Cart> {
        this.loading.set(true);
        return this.http.delete<{ success: boolean; data: { cart: Cart } }>(
            `${environment.apiUrl}/cart/coupon`,
            { headers: this.getHeaders() }
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.cart.set(response.data.cart);
                }
                this.loading.set(false);
            }),
            map(response => response.data.cart)
        );
    }

    mergeCarts(): Observable<Cart | null> {
        return this.http.post<{ success: boolean; data: { cart: Cart } }>(
            `${environment.apiUrl}/cart/merge`,
            {},
            { headers: this.getHeaders() }
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.cart.set(response.data.cart);
                }
            }),
            map(response => response.data.cart)
        );
    }
}
