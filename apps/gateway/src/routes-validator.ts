/**
 * Route Validator
 * This utility validates that all expected routes are properly configured in the gateway
 */

interface RouteConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  service: string;
  expectedBackendPath: string;
  description: string;
}

/**
 * Complete route configuration for the e-commerce API Gateway
 */
export const EXPECTED_ROUTES: RouteConfig[] = [
  // ==================== HEALTH CHECKS ====================
  { method: 'GET', path: '/health', service: 'gateway', expectedBackendPath: '/health', description: 'Gateway health check' },
  { method: 'GET', path: '/health/services', service: 'gateway', expectedBackendPath: '/health/services', description: 'Services health check' },
  
  // ==================== AUTHENTICATION & USER SERVICE ====================
  { method: 'POST', path: '/api/auth/register', service: 'user-service', expectedBackendPath: '/auth/register', description: 'Register new user' },
  { method: 'POST', path: '/api/auth/login', service: 'user-service', expectedBackendPath: '/auth/login', description: 'Login user' },
  { method: 'POST', path: '/api/auth/refresh', service: 'user-service', expectedBackendPath: '/auth/refresh', description: 'Refresh access token' },
  { method: 'POST', path: '/api/auth/logout', service: 'user-service', expectedBackendPath: '/auth/logout', description: 'Logout user' },
  { method: 'POST', path: '/api/auth/logout-all', service: 'user-service', expectedBackendPath: '/auth/logout-all', description: 'Logout from all devices' },
  { method: 'GET', path: '/api/auth/profile', service: 'user-service', expectedBackendPath: '/auth/profile', description: 'Get user profile' },
  { method: 'PUT', path: '/api/auth/profile', service: 'user-service', expectedBackendPath: '/auth/profile', description: 'Update user profile' },
  { method: 'PUT', path: '/api/auth/password', service: 'user-service', expectedBackendPath: '/auth/password', description: 'Change password' },
  { method: 'POST', path: '/api/auth/addresses', service: 'user-service', expectedBackendPath: '/auth/addresses', description: 'Add new address' },
  { method: 'PUT', path: '/api/auth/addresses/:addressId', service: 'user-service', expectedBackendPath: '/auth/addresses/:addressId', description: 'Update address' },
  { method: 'DELETE', path: '/api/auth/addresses/:addressId', service: 'user-service', expectedBackendPath: '/auth/addresses/:addressId', description: 'Delete address' },
  { method: 'GET', path: '/api/auth/users', service: 'user-service', expectedBackendPath: '/auth/users', description: 'Get all users (Admin)' },
  { method: 'PUT', path: '/api/auth/users/:userId/role', service: 'user-service', expectedBackendPath: '/auth/users/:userId/role', description: 'Update user role (Admin)' },
  { method: 'PUT', path: '/api/auth/users/:userId/toggle-status', service: 'user-service', expectedBackendPath: '/auth/users/:userId/toggle-status', description: 'Toggle user status (Admin)' },

  // ==================== PRODUCT SERVICE ====================
  { method: 'GET', path: '/api/products', service: 'product-service', expectedBackendPath: '/products', description: 'List all products' },
  { method: 'GET', path: '/api/products/featured', service: 'product-service', expectedBackendPath: '/products/featured', description: 'Get featured products' },
  { method: 'GET', path: '/api/products/search', service: 'product-service', expectedBackendPath: '/products/search', description: 'Search products' },
  { method: 'GET', path: '/api/products/low-stock', service: 'product-service', expectedBackendPath: '/products/low-stock', description: 'Get low stock products' },
  { method: 'GET', path: '/api/products/by-category', service: 'product-service', expectedBackendPath: '/products/by-category', description: 'Get products by category' },
  { method: 'GET', path: '/api/products/slug/:slug', service: 'product-service', expectedBackendPath: '/products/slug/:slug', description: 'Get product by slug' },
  { method: 'GET', path: '/api/products/:id', service: 'product-service', expectedBackendPath: '/products/:id', description: 'Get product by ID' },
  { method: 'GET', path: '/api/products/:id/related', service: 'product-service', expectedBackendPath: '/products/:id/related', description: 'Get related products' },
  { method: 'GET', path: '/api/products/:id/reviews', service: 'product-service', expectedBackendPath: '/products/:id/reviews', description: 'Get product reviews' },
  { method: 'POST', path: '/api/products', service: 'product-service', expectedBackendPath: '/products', description: 'Create product (Admin)' },
  { method: 'POST', path: '/api/products/:id/reviews', service: 'product-service', expectedBackendPath: '/products/:id/reviews', description: 'Create review' },
  { method: 'PUT', path: '/api/products/:id', service: 'product-service', expectedBackendPath: '/products/:id', description: 'Update product (Admin)' },
  { method: 'PUT', path: '/api/products/:id/inventory', service: 'product-service', expectedBackendPath: '/products/:id/inventory', description: 'Update inventory (Admin)' },
  { method: 'PUT', path: '/api/products/:productId/reviews/:reviewId', service: 'product-service', expectedBackendPath: '/products/:productId/reviews/:reviewId', description: 'Update review' },
  { method: 'DELETE', path: '/api/products/:id', service: 'product-service', expectedBackendPath: '/products/:id', description: 'Delete product (Admin)' },
  { method: 'DELETE', path: '/api/products/:productId/reviews/:reviewId', service: 'product-service', expectedBackendPath: '/products/:productId/reviews/:reviewId', description: 'Delete review' },
  { method: 'POST', path: '/api/products/:productId/reviews/:reviewId/helpful', service: 'product-service', expectedBackendPath: '/products/:productId/reviews/:reviewId/helpful', description: 'Mark review as helpful' },

  // ==================== CATEGORY SERVICE ====================
  { method: 'GET', path: '/api/categories', service: 'product-service', expectedBackendPath: '/categories', description: 'List all categories' },
  { method: 'GET', path: '/api/categories/tree', service: 'product-service', expectedBackendPath: '/categories/tree', description: 'Get category tree' },
  { method: 'GET', path: '/api/categories/slug/:slug', service: 'product-service', expectedBackendPath: '/categories/slug/:slug', description: 'Get category by slug' },
  { method: 'GET', path: '/api/categories/:id', service: 'product-service', expectedBackendPath: '/categories/:id', description: 'Get category by ID' },
  { method: 'GET', path: '/api/categories/:id/subcategories', service: 'product-service', expectedBackendPath: '/categories/:id/subcategories', description: 'Get subcategories' },
  { method: 'POST', path: '/api/categories', service: 'product-service', expectedBackendPath: '/categories', description: 'Create category (Admin)' },
  { method: 'PUT', path: '/api/categories/:id', service: 'product-service', expectedBackendPath: '/categories/:id', description: 'Update category (Admin)' },
  { method: 'PUT', path: '/api/categories/reorder', service: 'product-service', expectedBackendPath: '/categories/reorder', description: 'Reorder categories (Admin)' },
  { method: 'DELETE', path: '/api/categories/:id', service: 'product-service', expectedBackendPath: '/categories/:id', description: 'Delete category (Admin)' },

  // ==================== CART SERVICE ====================
  { method: 'GET', path: '/api/cart', service: 'cart-service', expectedBackendPath: '/cart', description: 'Get current cart' },
  { method: 'GET', path: '/api/cart/summary', service: 'cart-service', expectedBackendPath: '/cart/summary', description: 'Get cart summary' },
  { method: 'POST', path: '/api/cart/items', service: 'cart-service', expectedBackendPath: '/cart/items', description: 'Add item to cart' },
  { method: 'PUT', path: '/api/cart/items/:itemId', service: 'cart-service', expectedBackendPath: '/cart/items/:itemId', description: 'Update cart item quantity' },
  { method: 'DELETE', path: '/api/cart/items/:itemId', service: 'cart-service', expectedBackendPath: '/cart/items/:itemId', description: 'Remove item from cart' },
  { method: 'DELETE', path: '/api/cart/clear', service: 'cart-service', expectedBackendPath: '/cart/clear', description: 'Clear cart' },
  { method: 'POST', path: '/api/cart/coupon', service: 'cart-service', expectedBackendPath: '/cart/coupon', description: 'Apply coupon' },
  { method: 'DELETE', path: '/api/cart/coupon', service: 'cart-service', expectedBackendPath: '/cart/coupon', description: 'Remove coupon' },
  { method: 'POST', path: '/api/cart/merge', service: 'cart-service', expectedBackendPath: '/cart/merge', description: 'Merge guest and user cart' },

  // ==================== ORDER SERVICE ====================
  { method: 'POST', path: '/api/orders/checkout', service: 'order-service', expectedBackendPath: '/orders/checkout', description: 'Create order from cart' },
  { method: 'POST', path: '/api/orders/confirm-payment', service: 'order-service', expectedBackendPath: '/orders/confirm-payment', description: 'Confirm Stripe payment' },
  { method: 'POST', path: '/api/orders/webhook', service: 'order-service', expectedBackendPath: '/orders/webhook', description: 'Stripe webhook handler' },
  { method: 'GET', path: '/api/orders/my-orders', service: 'order-service', expectedBackendPath: '/orders/my-orders', description: 'Get current user orders' },
  { method: 'GET', path: '/api/orders/statistics', service: 'order-service', expectedBackendPath: '/orders/statistics', description: 'Get order statistics (Admin)' },
  { method: 'GET', path: '/api/orders/recent', service: 'order-service', expectedBackendPath: '/orders/recent', description: 'Get recent orders (Admin)' },
  { method: 'GET', path: '/api/orders/sales', service: 'order-service', expectedBackendPath: '/orders/sales', description: 'Get sales by date (Admin)' },
  { method: 'GET', path: '/api/orders/top-products', service: 'order-service', expectedBackendPath: '/orders/top-products', description: 'Get top selling products (Admin)' },
  { method: 'GET', path: '/api/orders', service: 'order-service', expectedBackendPath: '/orders', description: 'Get all orders (Admin)' },
  { method: 'GET', path: '/api/orders/number/:orderNumber', service: 'order-service', expectedBackendPath: '/orders/number/:orderNumber', description: 'Get order by number' },
  { method: 'GET', path: '/api/orders/:id', service: 'order-service', expectedBackendPath: '/orders/:id', description: 'Get order by ID' },
  { method: 'PUT', path: '/api/orders/:id/status', service: 'order-service', expectedBackendPath: '/orders/:id/status', description: 'Update order status (Admin)' },
  { method: 'PUT', path: '/api/orders/:id/cancel', service: 'order-service', expectedBackendPath: '/orders/:id/cancel', description: 'Cancel order' },
  { method: 'PUT', path: '/api/orders/:id/payment', service: 'order-service', expectedBackendPath: '/orders/:id/payment', description: 'Update payment status (Admin)' },
  { method: 'PUT', path: '/api/orders/:id/tracking', service: 'order-service', expectedBackendPath: '/orders/:id/tracking', description: 'Add tracking number (Admin)' },

  // ==================== ANALYTICS ====================
  { method: 'GET', path: '/api/analytics/dashboard', service: 'gateway', expectedBackendPath: '/api/analytics/dashboard', description: 'Get aggregated dashboard analytics' },
  
  // ==================== API DOCUMENTATION ====================
  { method: 'GET', path: '/api', service: 'gateway', expectedBackendPath: '/api', description: 'API documentation' },
];

/**
 * Validates route mappings
 */
export function validateRoutes(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const pathPatternMap = new Map<string, string[]>();

  // Check for duplicate route patterns
  EXPECTED_ROUTES.forEach(route => {
    const key = `${route.method} ${route.path}`;
    if (!pathPatternMap.has(key)) {
      pathPatternMap.set(key, []);
    }
    pathPatternMap.get(key)!.push(route.service);
  });

  pathPatternMap.forEach((services, key) => {
    if (services.length > 1) {
      errors.push(`Duplicate route detected: ${key} is handled by multiple services: ${services.join(', ')}`);
    }
  });

  // Validate path rewrite logic
  EXPECTED_ROUTES.forEach(route => {
    if (route.service !== 'gateway') {
      // Check if path rewrite is correct
      const gatewayPath = route.path;
      const backendPath = route.expectedBackendPath;
      
      // Validate that rewrite strips the service prefix correctly
      if (route.service === 'user-service' && gatewayPath.startsWith('/api/auth')) {
        if (!backendPath.startsWith('/auth')) {
          errors.push(`Invalid rewrite for ${gatewayPath}: expected backend path to start with /auth, got ${backendPath}`);
        }
      } else if (route.service === 'product-service' && gatewayPath.startsWith('/api/products')) {
        if (!backendPath.startsWith('/products')) {
          errors.push(`Invalid rewrite for ${gatewayPath}: expected backend path to start with /products, got ${backendPath}`);
        }
      } else if (route.service === 'product-service' && gatewayPath.startsWith('/api/categories')) {
        if (!backendPath.startsWith('/categories')) {
          errors.push(`Invalid rewrite for ${gatewayPath}: expected backend path to start with /categories, got ${backendPath}`);
        }
      } else if (route.service === 'cart-service' && gatewayPath.startsWith('/api/cart')) {
        if (!backendPath.startsWith('/cart')) {
          errors.push(`Invalid rewrite for ${gatewayPath}: expected backend path to start with /cart, got ${backendPath}`);
        }
      } else if (route.service === 'order-service' && gatewayPath.startsWith('/api/orders')) {
        if (!backendPath.startsWith('/orders')) {
          errors.push(`Invalid rewrite for ${gatewayPath}: expected backend path to start with /orders, got ${backendPath}`);
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Prints route summary
 */
export function printRouteSummary(): void {
  console.log('\n='.repeat(80));
  console.log('API GATEWAY ROUTE SUMMARY');
  console.log('='.repeat(80));

  const serviceGroups = EXPECTED_ROUTES.reduce((acc, route) => {
    if (!acc[route.service]) {
      acc[route.service] = [];
    }
    acc[route.service].push(route);
    return acc;
  }, {} as Record<string, RouteConfig[]>);

  Object.entries(serviceGroups).forEach(([service, routes]) => {
    console.log(`\n${service.toUpperCase()}`);
    console.log('-'.repeat(80));
    routes.forEach(route => {
      console.log(`  ${route.method.padEnd(6)} ${route.path.padEnd(50)} -> ${route.expectedBackendPath}`);
    });
  });

  console.log('\n' + '='.repeat(80));
  console.log(`Total routes: ${EXPECTED_ROUTES.length}`);
  console.log('='.repeat(80) + '\n');
}

// Run validation if this file is executed directly
if (require.main === module) {
  printRouteSummary();
  
  const validation = validateRoutes();
  
  if (validation.valid) {
    console.log('✅ All routes are valid!\n');
    process.exit(0);
  } else {
    console.log('❌ Route validation failed:\n');
    validation.errors.forEach(error => console.log(`  - ${error}`));
    console.log();
    process.exit(1);
  }
}
