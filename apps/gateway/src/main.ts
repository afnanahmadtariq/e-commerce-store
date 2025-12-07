import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env['HOST'] ?? 'localhost';
const port = process.env['PORT'] ? Number(process.env['PORT']) : 3000;

// Service URLs
const SERVICES = {
  USER_SERVICE: process.env['USER_SERVICE_URL'] || 'http://localhost:3001',
  PRODUCT_SERVICE: process.env['PRODUCT_SERVICE_URL'] || 'http://localhost:3002',
  CART_SERVICE: process.env['CART_SERVICE_URL'] || 'http://localhost:3003',
  ORDER_SERVICE: process.env['ORDER_SERVICE_URL'] || 'http://localhost:3004',
};

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO for real-time features
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env['CORS_ORIGIN'] || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected to gateway: ${socket.id}`);

  // Forward cart events to cart service
  socket.on('cart:join', (cartId) => {
    socket.join(`cart:${cartId}`);
  });

  socket.on('cart:leave', (cartId) => {
    socket.leave(`cart:${cartId}`);
  });

  // Admin dashboard room
  socket.on('admin:join', () => {
    socket.join('admin:dashboard');
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing for non-proxied routes
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: SERVICES,
  });
});

// Service health check
app.get('/health/services', async (req, res) => {
  const healthChecks: Record<string, { status: string; url: string }> = {};

  for (const [name, url] of Object.entries(SERVICES)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${url}/health`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        healthChecks[name] = { status: 'healthy', url };
      } else {
        healthChecks[name] = { status: 'unhealthy', url };
      }
    } catch {
      healthChecks[name] = { status: 'unreachable', url };
    }
  }

  res.json({
    success: true,
    services: healthChecks,
  });
});

// Proxy options factory
const createProxyOptions = (target: string, pathRewrite?: Record<string, string>): Options => ({
  target,
  changeOrigin: true,
  pathRewrite,
  on: {
    proxyReq: (proxyReq, req) => {
      // Forward authentication headers
      const headers = ['authorization', 'x-user-id', 'x-user-role', 'x-session-id'];
      headers.forEach((header) => {
        const value = (req as express.Request).headers[header];
        if (value) {
          proxyReq.setHeader(header, value as string);
        }
      });
    },
    proxyRes: (proxyRes, req, res) => {
      // Add CORS headers if needed
      proxyRes.headers['x-proxied-by'] = 'api-gateway';
    },
    error: (err, req, res) => {
      console.error('Proxy error:', err.message);
      (res as express.Response).status(503).json({
        success: false,
        message: 'Service temporarily unavailable',
        error: process.env['NODE_ENV'] === 'development' ? err.message : undefined,
      });
    },
  },
});

// ==================== ROUTE PROXIES ====================

// User Service - Authentication & Users
app.use(
  '/api/auth',
  createProxyMiddleware(createProxyOptions(SERVICES.USER_SERVICE, {
    '^/api/auth': '/auth',
  }))
);

app.use(
  '/api/users',
  createProxyMiddleware(createProxyOptions(SERVICES.USER_SERVICE, {
    '^/api/users': '/users',
  }))
);

// Product Service - Products & Categories
app.use(
  '/api/products',
  createProxyMiddleware(createProxyOptions(SERVICES.PRODUCT_SERVICE, {
    '^/api/products': '/products',
  }))
);

app.use(
  '/api/categories',
  createProxyMiddleware(createProxyOptions(SERVICES.PRODUCT_SERVICE, {
    '^/api/categories': '/categories',
  }))
);

// Cart Service
app.use(
  '/api/cart',
  createProxyMiddleware(createProxyOptions(SERVICES.CART_SERVICE, {
    '^/api/cart': '/cart',
  }))
);

// Order Service
app.use(
  '/api/orders',
  createProxyMiddleware(createProxyOptions(SERVICES.ORDER_SERVICE, {
    '^/api/orders': '/orders',
  }))
);

// ==================== ANALYTICS AGGREGATION ====================

// Combined analytics endpoint for admin dashboard
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const [orderStats, recentOrders, topProducts] = await Promise.all([
      fetch(`${SERVICES.ORDER_SERVICE}/orders/statistics`).then((r) => r.json()).catch(() => null),
      fetch(`${SERVICES.ORDER_SERVICE}/orders/recent?limit=5`).then((r) => r.json()).catch(() => null),
      fetch(`${SERVICES.ORDER_SERVICE}/orders/top-products?limit=5`).then((r) => r.json()).catch(() => null),
    ]);

    res.json({
      success: true,
      data: {
        statistics: orderStats?.data?.statistics || {},
        recentOrders: recentOrders?.data?.orders || [],
        topProducts: topProducts?.data?.products || [],
      },
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
    });
  }
});

// ==================== API DOCUMENTATION ====================

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'E-Commerce API Gateway',
    version: '1.0.0',
    endpoints: {
      auth: {
        base: '/api/auth',
        routes: [
          'POST /api/auth/register - Register new user',
          'POST /api/auth/login - Login user',
          'POST /api/auth/refresh - Refresh tokens',
          'POST /api/auth/logout - Logout user',
          'GET /api/auth/profile - Get user profile',
          'PUT /api/auth/profile - Update profile',
        ],
      },
      products: {
        base: '/api/products',
        routes: [
          'GET /api/products - List products',
          'GET /api/products/:id - Get product',
          'GET /api/products/slug/:slug - Get by slug',
          'GET /api/products/featured - Featured products',
          'GET /api/products/search?q= - Search products',
          'POST /api/products - Create product (admin)',
          'PUT /api/products/:id - Update product (admin)',
          'DELETE /api/products/:id - Delete product (admin)',
        ],
      },
      categories: {
        base: '/api/categories',
        routes: [
          'GET /api/categories - List categories',
          'GET /api/categories/tree - Category tree',
          'GET /api/categories/:id - Get category',
          'POST /api/categories - Create (admin)',
          'PUT /api/categories/:id - Update (admin)',
          'DELETE /api/categories/:id - Delete (admin)',
        ],
      },
      cart: {
        base: '/api/cart',
        routes: [
          'GET /api/cart - Get cart',
          'POST /api/cart/items - Add item',
          'PUT /api/cart/items/:itemId - Update quantity',
          'DELETE /api/cart/items/:itemId - Remove item',
          'DELETE /api/cart/clear - Clear cart',
          'POST /api/cart/coupon - Apply coupon',
          'DELETE /api/cart/coupon - Remove coupon',
        ],
      },
      orders: {
        base: '/api/orders',
        routes: [
          'POST /api/orders/checkout - Create order',
          'GET /api/orders/my-orders - User orders',
          'GET /api/orders/:id - Get order',
          'PUT /api/orders/:id/cancel - Cancel order',
          'GET /api/orders - All orders (admin)',
          'PUT /api/orders/:id/status - Update status (admin)',
        ],
      },
      analytics: {
        base: '/api/analytics',
        routes: [
          'GET /api/analytics/dashboard - Dashboard stats',
        ],
      },
    },
    websocket: {
      events: [
        'cart:join - Join cart room for updates',
        'cart:leave - Leave cart room',
        'cart:updated - Cart was updated',
        'cart:item_added - Item added to cart',
        'cart:item_removed - Item removed from cart',
        'admin:join - Join admin dashboard room',
      ],
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal gateway error',
  });
});

// Start server
httpServer.listen(port, host, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    E-Commerce API Gateway                       ║
╠════════════════════════════════════════════════════════════════╣
║  Gateway:    http://${host}:${port}                              
║  WebSocket:  ws://${host}:${port}                                
╠════════════════════════════════════════════════════════════════╣
║  Services:                                                      ║
║  • User Service:    ${SERVICES.USER_SERVICE}
║  • Product Service: ${SERVICES.PRODUCT_SERVICE}
║  • Cart Service:    ${SERVICES.CART_SERVICE}
║  • Order Service:   ${SERVICES.ORDER_SERVICE}
╚════════════════════════════════════════════════════════════════╝
  `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  io.close();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
