# Docker image for production
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build all backend services
RUN npm run build:gateway
RUN npm run build:user-service
RUN npm run build:product-service
RUN npm run build:cart-service
RUN npm run build:order-service

# Production image for Gateway
FROM base AS gateway
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder /app/dist/apps/gateway ./
COPY --from=deps /app/node_modules ./node_modules

USER expressjs

EXPOSE 3000

CMD ["node", "main.js"]

# Production image for User Service
FROM base AS user-service
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder /app/dist/apps/user-service ./
COPY --from=deps /app/node_modules ./node_modules

USER expressjs

EXPOSE 3001

CMD ["node", "main.js"]

# Production image for Product Service
FROM base AS product-service
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder /app/dist/apps/product-service ./
COPY --from=deps /app/node_modules ./node_modules

USER expressjs

EXPOSE 3002

CMD ["node", "main.js"]

# Production image for Cart Service
FROM base AS cart-service
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder /app/dist/apps/cart-service ./
COPY --from=deps /app/node_modules ./node_modules

USER expressjs

EXPOSE 3003

CMD ["node", "main.js"]

# Production image for Order Service
FROM base AS order-service
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder /app/dist/apps/order-service ./
COPY --from=deps /app/node_modules ./node_modules

USER expressjs

EXPOSE 3004

CMD ["node", "main.js"]
