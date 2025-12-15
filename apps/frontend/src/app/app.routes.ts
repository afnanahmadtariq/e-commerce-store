import { Route } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './guards/auth.guard';

export const appRoutes: Route[] = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'products',
        loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent)
    },
    {
        path: 'categories',
        loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent)
    },
    {
        path: 'products/:slug',
        loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
    },
    {
        path: 'cart',
        loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent)
    },
    {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
        canActivate: [authGuard]
    },
    {
        path: 'orders',
        loadComponent: () => import('./pages/orders/orders.component').then(m => m.OrdersComponent),
        canActivate: [authGuard]
    },
    {
        path: 'orders/:id',
        loadComponent: () => import('./pages/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
    },
    {
        path: 'auth/login',
        loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'auth/register',
        loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'admin',
        loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
        canActivate: [adminGuard]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
