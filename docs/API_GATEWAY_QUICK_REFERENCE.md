# API Gateway Quick Reference

## Service URLs

| Service | Development | Production |
|---------|-------------|------------|
| Gateway | http://localhost:3000 | http://api.yourdomain.com |
| User Service | http://localhost:3001 | Internal only |
| Product Service | http://localhost:3002 | Internal only |
| Cart Service | http://localhost:3003 | Internal only |
| Order Service | http://localhost:3004 | Internal only |

## Quick Start

### Start All Services
```bash
# Start MongoDB
docker run -d -p 27017:27017 mongo:7

# Set environment variables
export MONGODB_URI=mongodb://localhost:27017
export JWT_SECRET=your-secret-key
export JWT_REFRESH_SECRET=your-refresh-secret

# Start all services
npm run start
```

### Start Individual Services
```bash
npm run start:gateway
npm run start:user-service
npm run start:product-service
npm run start:cart-service
npm run start:order-service
```

## Common Routes

### Health Checks
```bash
# Gateway health
curl http://localhost:3000/health

# All services health
curl http://localhost:3000/health/services
```

### API Documentation
```bash
# Get full API documentation
curl http://localhost:3000/api | jq
```

### Authentication
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'

# Get Profile (requires auth token)
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Products
```bash
# List products
curl http://localhost:3000/api/products

# Search products
curl "http://localhost:3000/api/products/search?q=laptop"

# Get featured products
curl http://localhost:3000/api/products/featured

# Get product by ID
curl http://localhost:3000/api/products/PRODUCT_ID
```

### Categories
```bash
# List categories
curl http://localhost:3000/api/categories

# Get category tree
curl http://localhost:3000/api/categories/tree
```

### Cart
```bash
# Get cart (requires x-session-id or x-user-id header)
curl http://localhost:3000/api/cart \
  -H "x-session-id: guest-123"

# Add item to cart
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -H "x-session-id: guest-123" \
  -d '{
    "productId": "PRODUCT_ID",
    "name": "Product Name",
    "slug": "product-slug",
    "image": "image-url",
    "price": 99.99,
    "quantity": 1
  }'
```

### Orders
```bash
# Checkout (requires auth)
curl -X POST http://localhost:3000/api/orders/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-user-id: USER_ID" \
  -d '{
    "items": [...],
    "shippingAddress": {...},
    "paymentMethod": "card"
  }'

# Get my orders (requires auth)
curl http://localhost:3000/api/orders/my-orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-user-id: USER_ID"
```

### Analytics (Admin)
```bash
# Get dashboard analytics
curl http://localhost:3000/api/analytics/dashboard

# Get order statistics
curl http://localhost:3000/api/orders/statistics

# Get top products
curl http://localhost:3000/api/orders/top-products
```

## Testing Routes

### Validate Route Configuration
```bash
# Run route validator
npx tsc apps/gateway/src/routes-validator.ts --outDir /tmp --module commonjs
node /tmp/routes-validator.js
```

### Run Integration Tests
```bash
# Start all services first, then run:
bash /tmp/test-gateway-routing.sh
```

## Headers

### Authentication
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### User Context (set by gateway after auth)
```
x-user-id: USER_ID
x-user-role: admin|customer
x-session-id: SESSION_ID
```

### Cart Context (guest users)
```
x-session-id: GUEST_SESSION_ID
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (dev mode only)"
}
```

## WebSocket Events

Connect to `ws://localhost:3000`

### Cart Events
```javascript
// Join cart room
socket.emit('cart:join', cartId);

// Leave cart room
socket.emit('cart:leave', cartId);

// Listen for updates
socket.on('cart:updated', (cart) => {
  console.log('Cart updated:', cart);
});

socket.on('cart:item_added', (item) => {
  console.log('Item added:', item);
});

socket.on('cart:item_removed', (itemId) => {
  console.log('Item removed:', itemId);
});
```

### Admin Events
```javascript
// Join admin dashboard room
socket.emit('admin:join');

// Listen for admin events
socket.on('order:created', (order) => {
  console.log('New order:', order);
});
```

## Environment Variables

### Gateway
```bash
PORT=3000
HOST=localhost
USER_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
CART_SERVICE_URL=http://localhost:3003
ORDER_SERVICE_URL=http://localhost:3004
CORS_ORIGIN=http://localhost:4200
```

### User Service
```bash
PORT=3001
MONGODB_URI=mongodb://localhost:27017
DB_NAME=ecommerce_users
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

### Product Service
```bash
PORT=3002
MONGODB_URI=mongodb://localhost:27017
DB_NAME=ecommerce_products
```

### Cart Service
```bash
PORT=3003
MONGODB_URI=mongodb://localhost:27017
DB_NAME=ecommerce_carts
```

### Order Service
```bash
PORT=3004
MONGODB_URI=mongodb://localhost:27017
DB_NAME=ecommerce_orders
```

## Troubleshooting

### Service Not Responding
```bash
# Check service health
curl http://localhost:3000/health/services | jq

# Check specific service directly
curl http://localhost:3001/health  # User service
curl http://localhost:3002/health  # Product service
curl http://localhost:3003/health  # Cart service
curl http://localhost:3004/health  # Order service
```

### Route Not Found
1. Check if service is running: `curl http://localhost:300X/health`
2. Verify route exists: `curl http://localhost:3000/api | jq`
3. Test service directly: `curl http://localhost:300X/endpoint`
4. Check gateway logs for proxy errors

### Path Rewriting Issues
The gateway strips the base path (`/api/products`) before proxying, so:
- Gateway receives: `/api/products/123`
- Proxy receives: `/123`
- Rewrite pattern `^/` transforms to: `/products/123`
- Backend receives: `/products/123` ✅

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| General | 500 requests | 15 minutes |
| Authentication | 10 requests | 15 minutes |
| Checkout | 5 requests | 1 minute |
| Cart Operations | 300 requests | 15 minutes |

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f gateway`
2. Review documentation: `/docs` directory
3. Validate routes: `node /tmp/routes-validator.js`
4. Test integration: `bash /tmp/test-gateway-routing.sh`
