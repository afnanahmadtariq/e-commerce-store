# REST API Specifications

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

All responses follow this structure:

```json
{
  "success": true | false,
  "message": "Optional message",
  "data": { ... } | null,
  "errors": [...] | null
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}

Response: 201 Created
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "64abc...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 900
    }
  }
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": 900
    }
  }
}
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "firstName": "...",
      "lastName": "...",
      "phone": "...",
      "role": "customer",
      "isVerified": true,
      "addresses": [...]
    }
  }
}
```

### Update Profile

```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1987654321"
}

Response: 200 OK
```

### Change Password

```http
PUT /api/auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}

Response: 200 OK
```

### Add Address

```http
POST /api/auth/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "home",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zipCode": "10001",
  "isDefault": true
}

Response: 201 Created
```

---

## 2. Product Endpoints (`/api/products`)

### List Products

```http
GET /api/products?category=electronics&minPrice=10&maxPrice=100&sortBy=price&sortOrder=asc&page=1&limit=20

Response: 200 OK
{
  "success": true,
  "data": {
    "products": [...],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

Query Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category slug |
| subcategory | string | Filter by subcategory |
| brand | string | Filter by brand |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| search | string | Text search |
| sortBy | string | price, name, createdAt, ratings |
| sortOrder | string | asc, desc |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| inStock | boolean | Only in-stock items |
| isFeatured | boolean | Only featured items |

### Get Product by ID

```http
GET /api/products/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "product": {
      "_id": "...",
      "name": "Wireless Headphones",
      "slug": "wireless-headphones",
      "description": "...",
      "sku": "WH-001",
      "price": 149.99,
      "compareAtPrice": 199.99,
      "category": "electronics",
      "brand": "TechSound",
      "images": [...],
      "inventory": {
        "quantity": 100,
        "reservedQuantity": 5,
        "lowStockThreshold": 10
      },
      "ratings": {
        "average": 4.5,
        "count": 128
      }
    }
  }
}
```

### Get Product by Slug

```http
GET /api/products/slug/:slug
```

### Get Featured Products

```http
GET /api/products/featured?limit=10
```

### Search Products

```http
GET /api/products/search?q=headphones&limit=20
```

### Create Product (Admin)

```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "sku": "NP-001",
  "price": 99.99,
  "category": "electronics",
  "brand": "Brand",
  "tags": ["tag1", "tag2"],
  "images": [
    { "url": "https://...", "alt": "Image", "isPrimary": true, "order": 0 }
  ],
  "inventory": {
    "quantity": 50,
    "lowStockThreshold": 5,
    "trackInventory": true
  }
}

Response: 201 Created
```

### Update Product (Admin)

```http
PUT /api/products/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "price": 89.99 }

Response: 200 OK
```

### Delete Product (Admin)

```http
DELETE /api/products/:id
Authorization: Bearer <admin_token>

Response: 200 OK
```

### Update Inventory (Admin)

```http
PUT /api/products/:id/inventory
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "quantity": 100,
  "operation": "set" | "increment" | "decrement"
}
```

### Get Product Reviews

```http
GET /api/products/:id/reviews?page=1&limit=10&sortBy=createdAt

Response: 200 OK
{
  "success": true,
  "data": {
    "reviews": [...],
    "total": 50,
    "page": 1,
    "totalPages": 5,
    "averageRating": 4.5,
    "ratingDistribution": {
      "1": 2,
      "2": 5,
      "3": 10,
      "4": 15,
      "5": 18
    }
  }
}
```

### Create Review

```http
POST /api/products/:id/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "title": "Great product!",
  "content": "I love this product..."
}

Response: 201 Created
```

---

## 3. Category Endpoints (`/api/categories`)

### List Categories

```http
GET /api/categories

Response: 200 OK
{
  "success": true,
  "data": {
    "categories": [
      { "_id": "...", "name": "Electronics", "slug": "electronics", "productCount": 25 },
      ...
    ]
  }
}
```

### Get Category Tree

```http
GET /api/categories/tree

Response: 200 OK
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "...",
        "name": "Electronics",
        "slug": "electronics",
        "children": [
          { "_id": "...", "name": "Phones", "slug": "phones" },
          { "_id": "...", "name": "Laptops", "slug": "laptops" }
        ]
      }
    ]
  }
}
```

### Create Category (Admin)

```http
POST /api/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Category",
  "description": "Category description",
  "parentId": null,
  "image": "https://..."
}

Response: 201 Created
```

---

## 4. Cart Endpoints (`/api/cart`)

### Get Cart

```http
GET /api/cart
X-Session-ID: <session_id>
Authorization: Bearer <token> (optional)

Response: 200 OK
{
  "success": true,
  "data": {
    "cart": {
      "id": "...",
      "items": [
        {
          "_id": "...",
          "productId": "...",
          "name": "Product Name",
          "slug": "product-name",
          "image": "https://...",
          "price": 99.99,
          "originalPrice": 99.99,
          "quantity": 2,
          "maxQuantity": 10,
          "subtotal": 199.98
        }
      ],
      "itemCount": 2,
      "subtotal": 199.98,
      "discount": 0,
      "tax": 16.00,
      "shipping": 5.99,
      "total": 221.97,
      "freeShippingThreshold": 50,
      "amountToFreeShipping": 0,
      "coupon": null
    }
  }
}
```

### Add Item to Cart

```http
POST /api/cart/items
X-Session-ID: <session_id>
Content-Type: application/json

{
  "productId": "...",
  "variantId": null,
  "name": "Product Name",
  "slug": "product-name",
  "image": "https://...",
  "price": 99.99,
  "quantity": 1,
  "maxQuantity": 10
}

Response: 201 Created
```

### Update Item Quantity

```http
PUT /api/cart/items/:itemId
X-Session-ID: <session_id>
Content-Type: application/json

{
  "quantity": 3
}

Response: 200 OK
```

### Remove Item

```http
DELETE /api/cart/items/:itemId
X-Session-ID: <session_id>

Response: 200 OK
```

### Clear Cart

```http
DELETE /api/cart/clear
X-Session-ID: <session_id>

Response: 200 OK
```

### Apply Coupon

```http
POST /api/cart/coupon
X-Session-ID: <session_id>
Content-Type: application/json

{
  "code": "SAVE20"
}

Response: 200 OK
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "cart": {
      "coupon": {
        "code": "SAVE20",
        "discountType": "fixed",
        "discountValue": 20,
        "discountAmount": 20
      },
      "discount": 20,
      "total": 201.97
    }
  }
}
```

### Remove Coupon

```http
DELETE /api/cart/coupon
X-Session-ID: <session_id>

Response: 200 OK
```

---

## 5. Order Endpoints (`/api/orders`)

### Create Order (Checkout)

```http
POST /api/orders/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "...",
      "name": "Product",
      "slug": "product",
      "image": "https://...",
      "sku": "PROD-001",
      "price": 99.99,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  },
  "billingAddress": null,
  "paymentMethod": "credit_card",
  "subtotal": 199.98,
  "discount": 0,
  "tax": 16.00,
  "shipping": 5.99,
  "notes": "Please gift wrap"
}

Response: 201 Created
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-ABC123",
      "status": "pending",
      "total": 221.97
    }
  }
}
```

### Get User's Orders

```http
GET /api/orders/my-orders?page=1&limit=10
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "orders": [...],
    "total": 15,
    "page": 1,
    "totalPages": 2
  }
}
```

### Get Order by ID

```http
GET /api/orders/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-ABC123",
      "items": [...],
      "shippingAddress": {...},
      "payment": {
        "method": "credit_card",
        "status": "captured",
        "transactionId": "...",
        "paidAt": "..."
      },
      "status": "shipped",
      "statusHistory": [
        { "status": "pending", "timestamp": "...", "note": "Order placed" },
        { "status": "confirmed", "timestamp": "...", "note": "Payment received" },
        { "status": "shipped", "timestamp": "...", "note": "Tracking: ABC123" }
      ],
      "trackingNumber": "ABC123",
      "estimatedDelivery": "2024-01-15"
    }
  }
}
```

### Cancel Order

```http
PUT /api/orders/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Changed my mind"
}

Response: 200 OK
```

### Get All Orders (Admin)

```http
GET /api/orders?status=pending&page=1&limit=20
Authorization: Bearer <admin_token>

Response: 200 OK
```

### Update Order Status (Admin)

```http
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped",
  "note": "Shipped via FedEx"
}

Response: 200 OK
```

### Add Tracking Number (Admin)

```http
PUT /api/orders/:id/tracking
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "trackingNumber": "FEDEX123456"
}

Response: 200 OK
```

---

## 6. Analytics Endpoints (`/api/analytics`)

### Get Dashboard Statistics

```http
GET /api/analytics/dashboard
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "statistics": {
      "totalOrders": 1250,
      "totalRevenue": 125000,
      "averageOrderValue": 100,
      "pendingOrders": 45,
      "confirmedOrders": 30,
      "shippedOrders": 25,
      "deliveredOrders": 1100,
      "cancelledOrders": 50
    },
    "recentOrders": [...],
    "topProducts": [...]
  }
}
```

### Get Sales Data

```http
GET /api/orders/sales?startDate=2024-01-01&endDate=2024-01-31&groupBy=day
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "sales": [
      { "_id": "2024-01-01", "revenue": 5000, "orders": 50, "averageOrderValue": 100 },
      { "_id": "2024-01-02", "revenue": 6000, "orders": 55, "averageOrderValue": 109 },
      ...
    ]
  }
}
```

---

## Error Codes

| Code | Description                              |
| ---- | ---------------------------------------- |
| 400  | Bad Request - Invalid input              |
| 401  | Unauthorized - Missing/invalid token     |
| 403  | Forbidden - Insufficient permissions     |
| 404  | Not Found - Resource doesn't exist       |
| 409  | Conflict - Resource already exists       |
| 422  | Unprocessable Entity - Validation failed |
| 429  | Too Many Requests - Rate limit exceeded  |
| 500  | Internal Server Error                    |

## Rate Limits

| Endpoint        | Limit              |
| --------------- | ------------------ |
| Auth endpoints  | 10 requests/15min  |
| General API     | 100 requests/15min |
| Cart operations | 300 requests/15min |
| Checkout        | 5 requests/min     |
