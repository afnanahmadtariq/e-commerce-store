# System Architecture Documentation

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENTS                                    │
│     ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                │
│     │   Web App    │    │  Mobile App  │    │  Admin Panel │                │
│     │  (Angular)   │    │   (Future)   │    │   (Angular)  │                │
│     └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                │
└────────────┼───────────────────┼───────────────────┼────────────────────────┘
             │                   │                   │
             └───────────────────┼───────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NGINX REVERSE PROXY                                │
│     ┌─────────────────────────────────────────────────────────────────┐     │
│     │  • Load Balancing    • SSL Termination    • Gzip Compression   │     │
│     │  • Rate Limiting     • Static Caching     • WebSocket Upgrade  │     │
│     └─────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (Port: 3000)                              │
│     ┌─────────────────────────────────────────────────────────────────┐     │
│     │  • Request Routing      • JWT Validation    • Rate Limiting    │     │
│     │  • Request/Response     • CORS Handling     • Analytics        │     │
│     │    Transformation       • Health Checks     • Aggregation      │     │
│     └─────────────────────────────────────────────────────────────────┘     │
└───────────────────┬───────────────────┬───────────────────┬─────────────────┘
                    │                   │                   │
    ┌───────────────┴───────┐           │           ┌───────┴───────────────┐
    ▼                       ▼           ▼           ▼                       ▼
┌─────────┐  ┌─────────────────┐  ┌─────────────┐  ┌───────────────┐  ┌─────────┐
│  User   │  │    Product      │  │    Cart     │  │    Order      │  │ Future  │
│ Service │  │    Service      │  │   Service   │  │   Service     │  │Services │
│  :3001  │  │     :3002       │  │    :3003    │  │    :3004      │  │         │
└────┬────┘  └────────┬────────┘  └──────┬──────┘  └───────┬───────┘  └─────────┘
     │                │                  │                 │
     │                │                  │ (WebSocket)     │
     │                │                  │                 │
     └────────────────┴──────────────────┴─────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                          │
│     ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐       │
│     │    MongoDB      │    │     Redis       │    │   File Storage  │       │
│     │   (Primary DB)  │    │    (Cache)      │    │   (Images)      │       │
│     └─────────────────┘    └─────────────────┘    └─────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Microservices Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MICROSERVICES COMMUNICATION                         │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │    API Gateway   │
                              │                  │
                              │  • Routes /api/* │
                              │  • JWT Verify    │
                              │  • WebSocket Hub │
                              └────────┬─────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  USER SERVICE   │         │ PRODUCT SERVICE │         │  CART SERVICE   │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ POST /register  │         │ GET  /products  │         │ GET  /cart      │
│ POST /login     │         │ POST /products  │         │ POST /items     │
│ POST /refresh   │         │ PUT  /products  │         │ PUT  /items     │
│ GET  /profile   │◄────────│ DEL  /products  │────────►│ DEL  /items     │
│ PUT  /profile   │  User   │ GET  /reviews   │  Stock  │ POST /coupon    │
│ POST /addresses │  Auth   │ POST /reviews   │  Check  │ WS: Real-time   │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         │                           │                           │
         │   ┌───────────────────────┴───────────────────────┐   │
         │   │                                               │   │
         │   ▼                                               ▼   │
         │ ┌─────────────────────────────────────────────────────┐
         │ │                   ORDER SERVICE                     │
         │ ├─────────────────────────────────────────────────────┤
         │ │ POST /checkout     - Create order from cart         │
         │ │ GET  /orders       - List orders                    │
         │ │ GET  /orders/:id   - Get order details              │
         │ │ PUT  /orders/status- Update order status            │
         │ │ PUT  /orders/cancel- Cancel order                   │
         │ │ GET  /statistics   - Analytics data                 │
         └►│ GET  /sales        - Sales reports                  │
           └─────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │       FUTURE: Message Queue   │
                    │   ┌─────────────────────────┐ │
                    │   │  • Order Events         │ │
                    │   │  • Inventory Updates    │ │
                    │   │  • Email Notifications  │ │
                    │   │  • Analytics Events     │ │
                    │   └─────────────────────────┘ │
                    └───────────────────────────────┘
```

## 3. Database Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               DATABASE ERD                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│        USERS         │         │       SESSIONS       │
├──────────────────────┤         ├──────────────────────┤
│ _id: ObjectId (PK)   │◄───────┤│ _id: ObjectId (PK)   │
│ email: String (U)    │         │ userId: ObjectId(FK) │
│ password: String     │         │ refreshToken: String │
│ firstName: String    │         │ userAgent: String    │
│ lastName: String     │         │ ipAddress: String    │
│ phone: String        │         │ expiresAt: Date      │
│ role: Enum           │         │ isValid: Boolean     │
│ isActive: Boolean    │         │ createdAt: Date      │
│ isVerified: Boolean  │         └──────────────────────┘
│ avatar: String       │
│ addresses: Array     │    ┌──────────────────────┐
│   - type             │    │      CATEGORIES      │
│   - street           │    ├──────────────────────┤
│   - city             │    │ _id: ObjectId (PK)   │
│   - state            │    │ name: String         │
│   - country          │    │ slug: String (U)     │
│   - zipCode          │    │ description: String  │
│   - isDefault        │    │ parentId: ObjectId   │┐
│ createdAt: Date      │    │ image: String        ││ Self-reference
│ updatedAt: Date      │    │ isActive: Boolean    ││ (Hierarchical)
└──────────┬───────────┘    │ order: Number        │┘
           │                │ productCount: Number │
           │                │ createdAt: Date      │
           │                │ updatedAt: Date      │
           │                └──────────┬───────────┘
           │                           │
           │                           │
           │                           ▼
           │                ┌──────────────────────┐
           │                │       PRODUCTS       │
           │                ├──────────────────────┤
           │                │ _id: ObjectId (PK)   │
           │                │ name: String         │
           │                │ slug: String (U)     │
           │                │ description: String  │
           │                │ sku: String (U)      │
           │                │ price: Number        │
           │                │ category: String(FK) │
           │                │ brand: String        │
           │                │ tags: Array<String>  │
           │                │ images: Array        │
           │                │   - url              │
           │                │   - alt              │
           │                │   - isPrimary        │
           │                │ variants: Array      │
           │                │   - name             │
           │                │   - sku              │
           │                │   - price            │
           │                │   - inventory        │
           │                │ inventory: Object    │
           │                │   - quantity         │
           │                │   - reservedQty      │
           │                │   - lowStockLimit    │
           │                │ ratings: Object      │
           │                │   - average          │
           │                │   - count            │
           │                │ isActive: Boolean    │
           │                │ isFeatured: Boolean  │
           │                │ vendorId: ObjectId   │
           │                │ createdAt: Date      │
           │                │ updatedAt: Date      │
           │                └──────────┬───────────┘
           │                           │
           │                           │
           │    ┌──────────────────────┼──────────────────────┐
           │    │                      │                      │
           │    ▼                      ▼                      ▼
           │ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
           │ │     REVIEWS      │ │      CARTS       │ │     ORDERS       │
           │ ├──────────────────┤ ├──────────────────┤ ├──────────────────┤
           │ │ _id (PK)         │ │ _id (PK)         │ │ _id (PK)         │
           └►│ productId (FK)   │ │ userId (FK)      │◄┤ orderNumber (U)  │
             │ userId (FK)      │ │ sessionId        │ │ userId (FK)      │
             │ userName         │ │ items: Array     │ │ items: Array     │
             │ rating: Number   │ │   - productId    │ │   - productId    │
             │ title            │ │   - variantId    │ │   - name         │
             │ content          │ │   - name         │ │   - price        │
             │ isVerified       │ │   - price        │ │   - quantity     │
             │ helpfulCount     │ │   - quantity     │ │ shippingAddress  │
             │ images: Array    │ │   - subtotal     │ │ billingAddress   │
             │ createdAt        │ │ coupon: Object   │ │ payment: Object  │
             │ updatedAt        │ │ subtotal         │ │   - method       │
             └──────────────────┘ │ discount         │ │   - status       │
                                  │ tax              │ │   - transactionId│
                                  │ shipping         │ │ subtotal         │
                                  │ total            │ │ discount         │
                                  │ createdAt        │ │ tax              │
                                  │ updatedAt        │ │ shipping         │
                                  └──────────────────┘ │ total            │
                                                       │ status: Enum     │
                                                       │ statusHistory    │
                                                       │ trackingNumber   │
                                                       │ createdAt        │
                                                       │ updatedAt        │
                                                       └──────────────────┘

┌──────────────────────┐
│       COUPONS        │
├──────────────────────┤
│ _id: ObjectId (PK)   │
│ code: String (U)     │
│ description: String  │
│ discountType: Enum   │
│ discountValue: Number│
│ minOrderAmount       │
│ maxDiscountAmount    │
│ usageLimit           │
│ usedCount            │
│ validFrom: Date      │
│ validUntil: Date     │
│ isActive: Boolean    │
│ createdAt: Date      │
│ updatedAt: Date      │
└──────────────────────┘
```

## 4. API Gateway Routing Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY ROUTING                                 │
└─────────────────────────────────────────────────────────────────────────────┘

        CLIENT REQUEST                    GATEWAY                    MICROSERVICE
        ─────────────                    ───────                    ────────────

    ┌────────────────────┐
    │ GET /api/products  │
    │ Authorization:     │
    │   Bearer <token>   │───────────────┐
    │ X-Session-ID: xxx  │               │
    └────────────────────┘               │
                                         ▼
                         ┌───────────────────────────────┐
                         │         API GATEWAY           │
                         ├───────────────────────────────┤
                         │ 1. Extract JWT token          │
                         │ 2. Verify token signature     │
                         │ 3. Check expiration           │
                         │ 4. Extract user claims        │
                         │ 5. Apply rate limiting        │
                         │ 6. Match route pattern        │
                         │ 7. Proxy to service           │
                         └───────────────┬───────────────┘
                                         │
                                         ▼
                         ┌───────────────────────────────┐
                         │       ROUTE MATCHING          │
                         ├───────────────────────────────┤
                         │ /api/auth/*     → User Svc    │
                         │ /api/users/*    → User Svc    │
                         │ /api/products/* → Product Svc │
                         │ /api/categories/*→ Product Svc│
                         │ /api/cart/*     → Cart Svc    │
                         │ /api/orders/*   → Order Svc   │
                         │ /api/analytics/*→ Aggregated  │
                         └───────────────┬───────────────┘
                                         │
                                         ▼
                         ┌───────────────────────────────┐
                         │     HEADER FORWARDING         │
                         ├───────────────────────────────┤
                         │ X-User-ID: <from JWT>         │
                         │ X-User-Role: <from JWT>       │
                         │ X-Session-ID: <from header>   │
                         │ Authorization: <if present>   │
                         └───────────────┬───────────────┘
                                         │
                                         ▼
                        ┌─────────────────────────────────┐
                        │        PRODUCT SERVICE          │
                        │         (Port 3002)             │
                        ├─────────────────────────────────┤
                        │ Request: GET /products          │
                        │ Headers:                        │
                        │   X-User-ID: 123                │
                        │   X-User-Role: customer         │
                        │   X-Session-ID: abc             │
                        └─────────────────────────────────┘
```

## 5. Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌────────┐                  ┌────────┐                  ┌────────┐
    │ Client │                  │Gateway │                  │User Svc│
    └───┬────┘                  └───┬────┘                  └───┬────┘
        │                           │                           │
        │  1. POST /api/auth/login  │                           │
        │  { email, password }      │                           │
        │──────────────────────────►│                           │
        │                           │                           │
        │                           │  2. Proxy to User Service │
        │                           │──────────────────────────►│
        │                           │                           │
        │                           │         3. Validate       │
        │                           │         credentials       │
        │                           │                           │
        │                           │         4. Generate       │
        │                           │         JWT tokens        │
        │                           │                           │
        │                           │         5. Create         │
        │                           │         session           │
        │                           │                           │
        │                           │  6. { tokens, user }      │
        │                           │◄──────────────────────────│
        │                           │                           │
        │  7. { tokens, user }      │                           │
        │◄──────────────────────────│                           │
        │                           │                           │
        │  8. Store tokens locally  │                           │
        │                           │                           │
        │                           │                           │
        │  9. GET /api/products     │                           │
        │  Authorization: Bearer... │                           │
        │──────────────────────────►│                           │
        │                           │                           │
        │                           │  10. Validate JWT         │
        │                           │  Extract user claims      │
        │                           │                           │
        │                           │  11. Forward to Product   │
        │                           │      Service with claims  │
        │                           │──────────────────────────►│
        │                           │                           │
```

## 6. Real-time Cart Flow (WebSocket)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          REAL-TIME CART FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    Tab 1                  Gateway               Cart Service              Tab 2
    ─────                  ───────               ────────────              ─────
      │                        │                       │                      │
      │  1. Connect WS         │                       │                      │
      │───────────────────────►│                       │                      │
      │                        │                       │                      │
      │  2. cart:join(cartId)  │                       │                      │
      │───────────────────────►│                       │      Connect WS      │
      │                        │                       │◄─────────────────────│
      │                        │                       │                      │
      │                        │                       │   cart:join(cartId)  │
      │                        │                       │◄─────────────────────│
      │                        │                       │                      │
      │  3. POST /cart/items   │                       │                      │
      │───────────────────────►│                       │                      │
      │                        │  4. Add item          │                      │
      │                        │──────────────────────►│                      │
      │                        │                       │                      │
      │                        │  5. Emit update       │                      │
      │                        │◄──────────────────────│                      │
      │                        │                       │                      │
      │  6. cart:item_added    │                       │                      │
      │◄───────────────────────│                       │                      │
      │                        │                       │   6. cart:item_added │
      │                        │                       │─────────────────────►│
      │                        │                       │                      │
      │  Update UI             │                       │           Update UI  │
      │                        │                       │                      │
```

## 7. Order Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ORDER LIFECYCLE                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
    │ PENDING  │───────►│CONFIRMED │───────►│PROCESSING│───────►│ SHIPPED  │
    └──────────┘        └──────────┘        └──────────┘        └──────────┘
         │                   │                   │                    │
         │                   │                   │                    ▼
         │                   │                   │           ┌──────────────┐
         │                   │                   │           │OUT_FOR_DELIV │
         │                   │                   │           └──────────────┘
         │                   │                   │                    │
         ▼                   ▼                   ▼                    ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
    │ FAILED   │        │CANCELLED │        │CANCELLED │        │DELIVERED │
    └──────────┘        └──────────┘        └──────────┘        └──────────┘
                                                                      │
                                                                      ▼
                                                                 ┌──────────┐
                                                                 │ REFUNDED │
                                                                 └──────────┘

    Status Transitions:
    • PENDING → CONFIRMED, CANCELLED, FAILED
    • CONFIRMED → PROCESSING, CANCELLED
    • PROCESSING → SHIPPED, CANCELLED
    • SHIPPED → OUT_FOR_DELIVERY, DELIVERED
    • OUT_FOR_DELIVERY → DELIVERED
    • DELIVERED → REFUNDED
```

## 8. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEPLOYMENT ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            DOCKER HOST / KUBERNETES                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │                      NGINX (Port 80/443)                        │      │
│    │    ┌─────────────┬─────────────┬─────────────┬─────────────┐   │      │
│    │    │ SSL Term    │ Load Bal    │ Compression │ Rate Limit  │   │      │
│    │    └─────────────┴─────────────┴─────────────┴─────────────┘   │      │
│    └─────────────────────────────────────────────────────────────────┘      │
│                                     │                                        │
│                    ┌────────────────┴────────────────┐                      │
│                    │                                 │                      │
│    ┌───────────────▼───────────────┐ ┌──────────────▼───────────────┐      │
│    │        API GATEWAY            │ │         FRONTEND             │      │
│    │     ┌─────────────────┐       │ │    ┌─────────────────┐       │      │
│    │     │  Container      │       │ │    │   Container     │       │      │
│    │     │  Port: 3000     │       │ │    │   Port: 4200    │       │      │
│    │     └─────────────────┘       │ │    └─────────────────┘       │      │
│    └───────────────────────────────┘ └──────────────────────────────┘      │
│                    │                                                        │
│    ┌───────────────┼───────────────┬───────────────┬───────────────┐       │
│    ▼               ▼               ▼               ▼               │       │
│ ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐             │       │
│ │User Svc │   │Prod Svc │   │Cart Svc │   │Order Svc│             │       │
│ │  :3001  │   │  :3002  │   │  :3003  │   │  :3004  │             │       │
│ └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘             │       │
│      │             │             │             │                   │       │
│      └─────────────┴─────────────┴─────────────┘                   │       │
│                              │                                     │       │
│                              ▼                                     │       │
│    ┌──────────────────────────────────────────────────────────┐   │       │
│    │                     DATA LAYER                            │   │       │
│    │  ┌─────────────────┐        ┌─────────────────┐          │   │       │
│    │  │    MongoDB      │        │     Redis       │          │   │       │
│    │  │   (Volume)      │        │   (Optional)    │          │   │       │
│    │  └─────────────────┘        └─────────────────┘          │   │       │
│    └──────────────────────────────────────────────────────────┘   │       │
│                                                                    │       │
└─────────────────────────────────────────────────────────────────────────────┘

                                    OR

┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLOUD DEPLOYMENT                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐      │
│  │ CloudFlare │───►│ AWS ALB    │───►│ ECS/EKS    │───►│ MongoDB    │      │
│  │    CDN     │    │ Ingress    │    │ Cluster    │    │ Atlas      │      │
│  └────────────┘    └────────────┘    └────────────┘    └────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```
