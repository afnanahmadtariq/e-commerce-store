# 🛒 E-Commerce Platform

A distributed, scalable e-commerce platform built with **Node.js**, **Express**, **Angular**, **MongoDB**, and **Socket.IO**. Features a microservices architecture with real-time updates, JWT authentication, and Docker deployment.

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Real-time Features](#-real-time-features)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Angular)                         │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│   │  Auth   │ │Products │ │  Cart   │ │ Orders  │ │  Admin  │       │
│   └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │
└────────┼───────────┼───────────┼───────────┼───────────┼────────────┘
         │           │           │           │           │
         └───────────┴───────────┼───────────┴───────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Express + Socket.IO)               │
│           JWT Validation │ Rate Limiting │ Request Routing           │
└──────────────┬─────────────────┬─────────────────┬──────────────────┘
               │                 │                 │
       ┌───────┴───────┐ ┌───────┴───────┐ ┌───────┴───────┐
       ▼               ▼ ▼               ▼ ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ User Service │ │Product Svc   │ │ Cart Service │ │ Order Service│
│  Port: 3001  │ │ Port: 3002   │ │  Port: 3003  │ │  Port: 3004  │
│  - Auth      │ │- CRUD        │ │- Real-time   │ │- Workflow    │
│  - JWT/RBAC  │ │- Inventory   │ │- WebSocket   │ │- Lifecycle   │
│  - Sessions  │ │- Images      │ │- Pricing     │ │- Analytics   │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │
       └────────────────┴────────────────┴────────────────┘
                                 ▼
                        ┌───────────────┐
                        │   MongoDB     │
                        └───────────────┘
```

## ✨ Features

### User Management

- 🔐 JWT Authentication with refresh tokens
- 👥 Role-Based Access Control (Admin, Vendor, Customer, Support)
- 📝 Multi-step registration with email verification
- 🏠 Address management (multiple addresses per user)
- 🔒 Secure password hashing with bcrypt

### Product & Inventory

- 📦 Full CRUD operations for products
- 🏷️ Category management with hierarchical structure
- 📸 Image management (multiple images per product)
- 📊 Inventory tracking with low-stock alerts
- ⭐ Product reviews and ratings
- 🔍 Full-text search with filtering and sorting

### Shopping Cart

- 🛒 Real-time cart updates via WebSocket
- 💰 Intelligent price recalculation
- 🎟️ Coupon/discount code support
- 🔄 Cart merge on login (guest to user)
- 📱 Session-based cart for guests

### Order Processing

- 📋 Complete order workflow management
- 📦 Status tracking with history
- 💳 Multiple payment methods support
- 🚚 Shipping calculation
- ❌ Order cancellation with inventory release

### Admin Dashboard

- 📊 Sales analytics and charts
- 👥 User management
- 📦 Inventory management
- 🔔 Real-time notifications
- 📈 System metrics

## 🛠️ Tech Stack

| Layer                | Technology                         |
| -------------------- | ---------------------------------- |
| **Frontend**         | Angular 20, RxJS, Socket.IO Client |
| **API Gateway**      | Express.js, http-proxy-middleware  |
| **Backend Services** | Node.js, Express.js, TypeScript    |
| **Database**         | MongoDB with Mongoose ODM          |
| **Real-time**        | Socket.IO                          |
| **Authentication**   | JWT (JSON Web Tokens)              |
| **Validation**       | Joi                                |
| **Security**         | Helmet, CORS, Rate Limiting        |
| **Monorepo**         | Nx Workspace                       |
| **Deployment**       | Docker, Docker Compose, NGINX      |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6.0+ (or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/e-commerce-store.git
   cd e-commerce-store
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB** (if running locally)

   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   ```

5. **Seed the database** (optional)

   ```bash
   npm run db:seed
   ```

6. **Start all services**

   ```bash
   # Start all backend services
   npm start

   # Or start individual services
   npm run start:gateway        # Port 3000
   npm run start:user-service   # Port 3001
   npm run start:product-service # Port 3002
   npm run start:cart-service   # Port 3003
   npm run start:order-service  # Port 3004

   # Start frontend
   npm run start:frontend       # Port 4200
   ```

### Test Credentials (after seeding)

| Role     | Email                  | Password     |
| -------- | ---------------------- | ------------ |
| Admin    | admin@ecommerce.com    | Admin@123    |
| Vendor   | vendor@ecommerce.com   | Vendor@123   |
| Customer | customer@ecommerce.com | Customer@123 |

## 📁 Project Structure

```
e-commerce-store/
├── apps/
│   ├── frontend/              # Angular SPA
│   │   └── src/
│   │       ├── app/
│   │       │   ├── components/
│   │       │   ├── services/
│   │       │   ├── guards/
│   │       │   └── pages/
│   │       └── assets/
│   ├── gateway/               # API Gateway
│   │   └── src/main.ts
│   ├── user-service/          # Authentication & Users
│   │   └── src/
│   │       ├── models/
│   │       ├── services/
│   │       ├── routes/
│   │       ├── middleware/
│   │       └── validators/
│   ├── product-service/       # Products & Categories
│   │   └── src/
│   │       ├── models/
│   │       ├── services/
│   │       ├── routes/
│   │       └── validators/
│   ├── cart-service/          # Shopping Cart (Real-time)
│   │   └── src/
│   │       ├── models/
│   │       ├── services/
│   │       ├── routes/
│   │       └── socket/
│   └── order-service/         # Order Processing
│       └── src/
│           ├── models/
│           ├── services/
│           └── routes/
├── libs/
│   └── shared/                # Shared types & constants
│       └── src/
│           └── lib/
│               ├── types/
│               └── constants/
├── scripts/
│   └── seed-database.js       # Database seeding
├── docker-compose.yml         # Docker services
├── Dockerfile                 # Multi-stage Docker build
├── nginx.conf                 # NGINX configuration
└── package.json
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| POST   | `/api/auth/register`  | Register new user        |
| POST   | `/api/auth/login`     | Login user               |
| POST   | `/api/auth/refresh`   | Refresh access token     |
| POST   | `/api/auth/logout`    | Logout user              |
| GET    | `/api/auth/profile`   | Get current user profile |
| PUT    | `/api/auth/profile`   | Update user profile      |
| PUT    | `/api/auth/password`  | Change password          |
| POST   | `/api/auth/addresses` | Add address              |

### Product Endpoints

| Method | Endpoint                   | Description                  |
| ------ | -------------------------- | ---------------------------- |
| GET    | `/api/products`            | List products (with filters) |
| GET    | `/api/products/:id`        | Get product by ID            |
| GET    | `/api/products/slug/:slug` | Get product by slug          |
| GET    | `/api/products/featured`   | Get featured products        |
| GET    | `/api/products/search?q=`  | Search products              |
| POST   | `/api/products`            | Create product (Admin)       |
| PUT    | `/api/products/:id`        | Update product (Admin)       |
| DELETE | `/api/products/:id`        | Delete product (Admin)       |

### Cart Endpoints

| Method | Endpoint                  | Description          |
| ------ | ------------------------- | -------------------- |
| GET    | `/api/cart`               | Get current cart     |
| POST   | `/api/cart/items`         | Add item to cart     |
| PUT    | `/api/cart/items/:itemId` | Update item quantity |
| DELETE | `/api/cart/items/:itemId` | Remove item          |
| DELETE | `/api/cart/clear`         | Clear cart           |
| POST   | `/api/cart/coupon`        | Apply coupon         |
| DELETE | `/api/cart/coupon`        | Remove coupon        |

### Order Endpoints

| Method | Endpoint                 | Description            |
| ------ | ------------------------ | ---------------------- |
| POST   | `/api/orders/checkout`   | Create order           |
| GET    | `/api/orders/my-orders`  | Get user's orders      |
| GET    | `/api/orders/:id`        | Get order by ID        |
| PUT    | `/api/orders/:id/cancel` | Cancel order           |
| GET    | `/api/orders`            | Get all orders (Admin) |
| PUT    | `/api/orders/:id/status` | Update status (Admin)  |

## 🔄 Real-time Features

The platform uses Socket.IO for real-time updates:

### Cart Events

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000');

// Join cart room
socket.emit('cart:join', cartId);

// Listen for updates
socket.on('cart:updated', (data) => {
  console.log('Cart updated:', data.cart);
});

socket.on('cart:item_added', (data) => {
  console.log('Item added:', data.addedItem);
});

socket.on('cart:price_changed', (data) => {
  console.log('Price changed for product:', data.productId);
});
```

### Admin Dashboard Events

```javascript
socket.emit('admin:join');

socket.on('analytics:new_order', (order) => {
  // Update dashboard
});

socket.on('analytics:inventory_alert', (alert) => {
  // Show low stock notification
});
```

## 🐳 Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

1. **Set environment variables**

   ```bash
   export NODE_ENV=production
   export JWT_SECRET=your-production-secret
   export MONGODB_URI=mongodb+srv://...
   ```

2. **Build services**

   ```bash
   npm run build
   ```

3. **Start with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### MongoDB Atlas Setup

1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist your IP
4. Get the connection string
5. Set `MONGODB_URI` in your environment

## 🧪 Testing

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Run specific service tests
nx test user-service
```

## 📊 Monitoring

The gateway provides health check endpoints:

```bash
# Gateway health
curl http://localhost:3000/health

# All services health
curl http://localhost:3000/health/services
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Nx](https://nx.dev) workspace
- UI designed with Angular
- Real-time powered by Socket.IO
- Database by MongoDB

---

**Made with ❤️ for CSE336 Web Technologies & CSE350 New Product Development**
