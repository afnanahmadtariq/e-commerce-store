import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, BehaviorSubject, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'customer' | 'admin' | 'vendor' | 'support';
    isVerified: boolean;
    avatar?: string;
    addresses: Address[];
}

export interface Address {
    _id?: string;
    type: 'home' | 'work' | 'other';
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    isDefault: boolean;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly TOKEN_KEY = 'auth_tokens';
    private readonly USER_KEY = 'auth_user';
    private readonly platformId = inject(PLATFORM_ID);

    private userSubject = new BehaviorSubject<User | null>(null);
    user$ = this.userSubject.asObservable();

    isAuthenticated = signal(false);
    currentUser = signal<User | null>(null);
    isAdmin = computed(() => this.currentUser()?.role === 'admin');

    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.userSubject.next(this.getStoredUser());
            this.isAuthenticated.set(this.hasValidToken());
            this.currentUser.set(this.getStoredUser());
            this.checkAuthStatus();
        }
    }

    private checkAuthStatus(): void {
        const tokens = this.getTokens();
        if (tokens) {
            this.getProfile().subscribe();
        }
    }

    register(data: RegisterRequest): Observable<{ user: User; tokens: AuthTokens }> {
        return this.http.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
            `${environment.apiUrl}/auth/register`,
            data
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.setSession(response.data.tokens, response.data.user);
                }
            }),
            map(response => response.data),
            catchError(error => {
                // If backend returns validation errors array, pass it through
                if (error.error && error.error.errors) {
                    throw { errors: error.error.errors, message: error.error.message };
                }
                throw error.error?.message || 'Registration failed';
            })
        );
    }

    login(credentials: LoginRequest): Observable<{ user: User; tokens: AuthTokens }> {
        return this.http.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
            `${environment.apiUrl}/auth/login`,
            credentials
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.setSession(response.data.tokens, response.data.user);
                }
            }),
            map(response => response.data),
            catchError(error => {
                throw error.error?.message || 'Login failed';
            })
        );
    }

    logout(): void {
        const tokens = this.getTokens();
        if (tokens) {
            this.http.post(`${environment.apiUrl}/auth/logout`, {
                refreshToken: tokens.refreshToken
            }).subscribe();
        }
        this.clearSession();
        this.router.navigate(['/']);
    }

    getProfile(): Observable<User | null> {
        return this.http.get<ApiResponse<{ user: User }>>(
            `${environment.apiUrl}/auth/profile`
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.currentUser.set(response.data.user);
                    this.userSubject.next(response.data.user);
                    if (isPlatformBrowser(this.platformId)) {
                        localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
                    }
                }
            }),
            map(response => response.data.user),
            catchError(() => {
                this.clearSession();
                return of(null);
            })
        );
    }

    updateProfile(data: Partial<User>): Observable<User> {
        return this.http.put<ApiResponse<{ user: User }>>(
            `${environment.apiUrl}/auth/profile`,
            data
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.currentUser.set(response.data.user);
                    this.userSubject.next(response.data.user);
                    if (isPlatformBrowser(this.platformId)) {
                        localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
                    }
                }
            }),
            map(response => response.data.user)
        );
    }

    addAddress(address: Omit<Address, '_id'>): Observable<User> {
        return this.http.post<ApiResponse<{ user: User }>>(
            `${environment.apiUrl}/auth/addresses`,
            address
        ).pipe(
            tap(response => {
                if (response.success) {
                    this.currentUser.set(response.data.user);
                    this.userSubject.next(response.data.user);
                }
            }),
            map(response => response.data.user)
        );
    }

    private setSession(tokens: AuthTokens, user: User): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokens));
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
        this.isAuthenticated.set(true);
        this.currentUser.set(user);
        this.userSubject.next(user);
    }

    private clearSession(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.USER_KEY);
        }
        this.isAuthenticated.set(false);
        this.currentUser.set(null);
        this.userSubject.next(null);
    }

    getTokens(): AuthTokens | null {
        if (!isPlatformBrowser(this.platformId)) {
            return null;
        }
        const tokens = localStorage.getItem(this.TOKEN_KEY);
        return tokens ? JSON.parse(tokens) : null;
    }

    private getStoredUser(): User | null {
        if (!isPlatformBrowser(this.platformId)) {
            return null;
        }
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    private hasValidToken(): boolean {
        return !!this.getTokens();
    }

    getAccessToken(): string | null {
        const tokens = this.getTokens();
        return tokens?.accessToken || null;
    }
}
