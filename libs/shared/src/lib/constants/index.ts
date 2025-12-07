// Shared Constants for E-Commerce Platform

export const API_ROUTES = {
  // User Service
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    PROFILE: '/auth/profile',
  },
  USERS: {
    BASE: '/users',
    BY_ID: '/users/:id',
    ADDRESSES: '/users/:id/addresses',
  },

  // Product Service
  PRODUCTS: {
    BASE: '/products',
    BY_ID: '/products/:id',
    BY_SLUG: '/products/slug/:slug',
    SEARCH: '/products/search',
    FEATURED: '/products/featured',
    REVIEWS: '/products/:id/reviews',
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: '/categories/:id',
    BY_SLUG: '/categories/slug/:slug',
  },
  INVENTORY: {
    BASE: '/inventory',
    BY_PRODUCT: '/inventory/product/:productId',
    SYNC: '/inventory/sync',
    LOW_STOCK: '/inventory/low-stock',
  },

  // Cart Service
  CART: {
    BASE: '/cart',
    ITEMS: '/cart/items',
    ITEM_BY_ID: '/cart/items/:itemId',
    APPLY_COUPON: '/cart/coupon',
    REMOVE_COUPON: '/cart/coupon',
    SUMMARY: '/cart/summary',
    CLEAR: '/cart/clear',
  },

  // Order Service
  ORDERS: {
    BASE: '/orders',
    BY_ID: '/orders/:id',
    BY_NUMBER: '/orders/number/:orderNumber',
    MY_ORDERS: '/orders/my-orders',
    CHECKOUT: '/orders/checkout',
    CANCEL: '/orders/:id/cancel',
    UPDATE_STATUS: '/orders/:id/status',
  },

  // Admin Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    SALES: '/analytics/sales',
    PRODUCTS: '/analytics/products',
    CUSTOMERS: '/analytics/customers',
    INVENTORY: '/analytics/inventory',
    REPORTS: '/analytics/reports',
  },
} as const;

export const SERVICE_PORTS = {
  GATEWAY: 3000,
  USER_SERVICE: 3001,
  PRODUCT_SERVICE: 3002,
  CART_SERVICE: 3003,
  ORDER_SERVICE: 3004,
} as const;

export const SERVICE_URLS = {
  USER_SERVICE: process.env['USER_SERVICE_URL'] || 'http://localhost:3001',
  PRODUCT_SERVICE: process.env['PRODUCT_SERVICE_URL'] || 'http://localhost:3002',
  CART_SERVICE: process.env['CART_SERVICE_URL'] || 'http://localhost:3003',
  ORDER_SERVICE: process.env['ORDER_SERVICE_URL'] || 'http://localhost:3004',
} as const;

export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  ALGORITHM: 'HS256' as const,
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_MAX_REQUESTS: 10,
} as const;

export const TAX_RATE = 0.08; // 8% tax
export const DEFAULT_CURRENCY = 'USD';
