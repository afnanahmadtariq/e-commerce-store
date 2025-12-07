import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <header class="header">
      <div class="container header-content">
        <!-- Logo -->
        <a routerLink="/" class="logo">
          <span class="logo-icon">🛍️</span>
          <span class="logo-text">ShopVerse</span>
        </a>

        <!-- Navigation -->
        <nav class="nav hidden-mobile">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a routerLink="/products" routerLinkActive="active">Products</a>
          <a routerLink="/categories" routerLinkActive="active">Categories</a>
          @if (authService.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active">Admin</a>
          }
        </nav>

        <!-- Search Bar -->
        <div class="search-bar hidden-mobile">
          <input 
            type="text" 
            placeholder="Search products..." 
            class="search-input"
            (keyup.enter)="onSearch($event)"
          />
          <button class="search-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
        </div>

        <!-- Actions -->
        <div class="header-actions">
          <!-- Cart -->
          <a routerLink="/cart" class="cart-btn">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            @if (cartService.itemCount() > 0) {
              <span class="cart-badge">{{ cartService.itemCount() }}</span>
            }
          </a>

          <!-- User Menu -->
          @if (authService.isAuthenticated()) {
            <div class="user-menu">
              <button class="user-btn" (click)="toggleUserMenu()">
                <div class="avatar">
                  {{ getUserInitials() }}
                </div>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              @if (showUserMenu) {
                <div class="user-dropdown">
                  <div class="user-info">
                    <strong>{{ authService.currentUser()?.firstName }}</strong>
                    <span>{{ authService.currentUser()?.email }}</span>
                  </div>
                  <div class="dropdown-divider"></div>
                  <a routerLink="/profile" (click)="showUserMenu = false">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    My Profile
                  </a>
                  <a routerLink="/orders" (click)="showUserMenu = false">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    My Orders
                  </a>
                  <div class="dropdown-divider"></div>
                  <button (click)="logout()">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Logout
                  </button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/auth/login" class="btn btn-primary btn-sm">Sign In</a>
          }

          <!-- Mobile Menu Toggle -->
          <button class="mobile-menu-btn hidden-desktop" (click)="toggleMobileMenu()">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (showMobileMenu) {
        <div class="mobile-menu">
          <a routerLink="/" (click)="showMobileMenu = false">Home</a>
          <a routerLink="/products" (click)="showMobileMenu = false">Products</a>
          <a routerLink="/categories" (click)="showMobileMenu = false">Categories</a>
          @if (authService.isAuthenticated()) {
            <a routerLink="/profile" (click)="showMobileMenu = false">My Profile</a>
            <a routerLink="/orders" (click)="showMobileMenu = false">My Orders</a>
          }
        </div>
      }
    </header>
  `,
    styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--gray-100);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: var(--space-xl);
      height: 72px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      text-decoration: none;
    }

    .logo-icon {
      font-size: 1.75rem;
    }

    .logo-text {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .nav {
      display: flex;
      gap: var(--space-lg);
    }

    .nav a {
      color: var(--gray-600);
      font-weight: 500;
      padding: var(--space-sm) 0;
      position: relative;
    }

    .nav a:hover,
    .nav a.active {
      color: var(--primary-600);
    }

    .nav a.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--gradient-primary);
      border-radius: 1px;
    }

    .search-bar {
      flex: 1;
      max-width: 400px;
      position: relative;
    }

    .search-input {
      width: 100%;
      padding: 0.625rem 1rem;
      padding-right: 2.5rem;
      background: var(--gray-100);
      border: 1px solid transparent;
      border-radius: var(--radius-full);
      font-size: 0.875rem;
      transition: all var(--transition-fast);
    }

    .search-input:focus {
      background: white;
      border-color: var(--primary-300);
      outline: none;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }

    .search-btn {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--gray-400);
      cursor: pointer;
      padding: 0.25rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }

    .cart-btn {
      position: relative;
      color: var(--gray-700);
      padding: var(--space-sm);
      border-radius: var(--radius-full);
      transition: all var(--transition-fast);
    }

    .cart-btn:hover {
      background: var(--gray-100);
      color: var(--primary-600);
    }

    .cart-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      background: var(--gradient-primary);
      color: white;
      font-size: 0.625rem;
      font-weight: 700;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-menu {
      position: relative;
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--space-xs);
      border-radius: var(--radius-full);
    }

    .user-btn:hover {
      background: var(--gray-100);
    }

    .avatar {
      width: 36px;
      height: 36px;
      background: var(--gradient-primary);
      color: white;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 200px;
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--gray-100);
      overflow: hidden;
      animation: fadeIn 0.2s ease;
    }

    .user-info {
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
    }

    .user-info strong {
      color: var(--gray-900);
    }

    .user-info span {
      font-size: 0.8125rem;
      color: var(--gray-500);
    }

    .dropdown-divider {
      height: 1px;
      background: var(--gray-100);
    }

    .user-dropdown a,
    .user-dropdown button {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      width: 100%;
      padding: var(--space-sm) var(--space-md);
      color: var(--gray-700);
      font-size: 0.875rem;
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      text-decoration: none;
    }

    .user-dropdown a:hover,
    .user-dropdown button:hover {
      background: var(--gray-50);
      color: var(--primary-600);
    }

    .mobile-menu-btn {
      background: none;
      border: none;
      color: var(--gray-700);
      cursor: pointer;
      padding: var(--space-sm);
    }

    .mobile-menu {
      display: flex;
      flex-direction: column;
      padding: var(--space-md);
      border-top: 1px solid var(--gray-100);
    }

    .mobile-menu a {
      padding: var(--space-sm) var(--space-md);
      color: var(--gray-700);
      border-radius: var(--radius-md);
    }

    .mobile-menu a:hover {
      background: var(--gray-50);
    }
  `]
})
export class HeaderComponent {
    authService = inject(AuthService);
    cartService = inject(CartService);

    showUserMenu = false;
    showMobileMenu = false;

    toggleUserMenu(): void {
        this.showUserMenu = !this.showUserMenu;
    }

    toggleMobileMenu(): void {
        this.showMobileMenu = !this.showMobileMenu;
    }

    getUserInitials(): string {
        const user = this.authService.currentUser();
        if (!user) return '?';
        return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }

    logout(): void {
        this.showUserMenu = false;
        this.authService.logout();
    }

    onSearch(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.value.trim()) {
            // Navigate to products with search query
            window.location.href = `/products?search=${encodeURIComponent(input.value.trim())}`;
        }
    }
}
