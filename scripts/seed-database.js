/**
 * Database Seeding Script for E-Commerce Platform
 * Run with: node scripts/seed-database.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local or .env
const envFile = fs.existsSync(path.join(__dirname, '../.env.local'))
  ? '.env.local'
  : '.env';
require('dotenv').config({ path: path.join(__dirname, '..', envFile) });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const dbConfigs = {
  users: process.env.MONGODB_URI?.replace(/\/[^/]*(\?|$)/, `/ecommerce_users$1`) || 'mongodb://localhost:27017/ecommerce_users',
  products: process.env.MONGODB_URI?.replace(/\/[^/]*(\?|$)/, `/ecommerce_products$1`) || 'mongodb://localhost:27017/ecommerce_products',
  carts: process.env.MONGODB_URI?.replace(/\/[^/]*(\?|$)/, `/ecommerce_carts$1`) || 'mongodb://localhost:27017/ecommerce_carts',
  orders: process.env.MONGODB_URI?.replace(/\/[^/]*(\?|$)/, `/ecommerce_orders$1`) || 'mongodb://localhost:27017/ecommerce_orders',
};

// Sample data
const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Latest electronic devices and gadgets', order: 1 },
  { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel for all', order: 2 },
  { name: 'Books', slug: 'books', description: 'Wide collection of books', order: 3 },
  { name: 'Home & Garden', slug: 'home-garden', description: 'Everything for your home', order: 4 },
  { name: 'Sports', slug: 'sports', description: 'Sports equipment and accessories', order: 5 },
];

const products = [
  // Electronics
  {
    name: 'Wireless Headphones Pro',
    slug: 'wireless-headphones-pro',
    description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
    shortDescription: 'Premium wireless headphones with ANC',
    sku: 'WHP-001',
    price: 199.99,
    compareAtPrice: 249.99,
    category: 'Electronics',
    brand: 'AudioTech',
    tags: ['wireless', 'headphones', 'audio', 'premium'],
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', alt: 'Headphones front view', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 50, trackInventory: true, lowStockThreshold: 10 },
    specifications: { Color: 'Black', Weight: '250g', Battery: '30 hours' },
    isFeatured: true,
    ratings: { average: 4.8, count: 124 }
  },
  {
    name: 'Smart Watch Series 5',
    slug: 'smart-watch-series-5',
    description: 'Advanced smartwatch with health tracking, GPS, and water resistance.',
    shortDescription: 'Advanced smartwatch with health tracking',
    sku: 'SW-005',
    price: 299.99,
    category: 'Electronics',
    brand: 'TechWear',
    tags: ['smartwatch', 'fitness', 'health'],
    images: [
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', alt: 'Smart watch', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 30, trackInventory: true },
    isFeatured: true,
    ratings: { average: 4.6, count: 89 }
  },
  {
    name: '4K Ultra HD Gaming Monitor',
    slug: '4k-ultra-hd-gaming-monitor',
    description: '27-inch 4K UHD monitor with 144Hz refresh rate and 1ms response time.',
    sku: 'GM-4K-001',
    price: 499.99,
    category: 'Electronics',
    brand: 'ViewMaster',
    tags: ['monitor', 'gaming', '4k', 'display'],
    images: [
      { url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf', alt: 'Gaming Monitor', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 20, trackInventory: true },
    ratings: { average: 4.9, count: 56 }
  },
  {
    name: 'Mechanical RGB Keyboard',
    slug: 'mechanical-rgb-keyboard',
    description: 'High-performance mechanical keyboard with customizable RGB lighting and Blue switches.',
    sku: 'KB-RGB-001',
    price: 129.99,
    category: 'Electronics',
    brand: 'KeyPro',
    tags: ['keyboard', 'gaming', 'rgb', 'mechanical'],
    images: [
      { url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae', alt: 'RGB Keyboard', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 45, trackInventory: true },
    isFeatured: true,
    ratings: { average: 4.7, count: 203 }
  },
  {
    name: 'Professional Mirrorless Camera',
    slug: 'professional-mirrorless-camera',
    description: '24MP full-frame mirrorless camera with 4K video recording and image stabilization.',
    sku: 'CAM-PRO-001',
    price: 1499.99,
    category: 'Electronics',
    brand: 'PhotoMaster',
    tags: ['camera', 'photography', '4k', 'video'],
    images: [
      { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32', alt: 'Camera', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 10, trackInventory: true },
    ratings: { average: 4.8, count: 42 }
  },
  {
    name: 'Wireless Noise Cancelling Earbuds',
    slug: 'wireless-noise-cancelling-earbuds',
    description: 'True wireless earbuds with active noise cancellation and waterproof design.',
    sku: 'EAR-NC-001',
    price: 149.99,
    category: 'Electronics',
    brand: 'AudioTech',
    tags: ['earbuds', 'wireless', 'audio', 'waterproof'],
    images: [
      { url: '/images/products/wireless-earbuds.png', alt: 'Earbuds', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 100, trackInventory: true },
    isFeatured: true,
    ratings: { average: 4.5, count: 312 }
  },
  {
    name: 'Smart Home Security Camera',
    slug: 'smart-home-security-camera',
    description: '1080p indoor security camera with night vision and two-way audio.',
    sku: 'SEC-CAM-001',
    price: 59.99,
    category: 'Electronics',
    brand: 'SecureHome',
    tags: ['security', 'smart home', 'camera', 'wifi'],
    images: [
      { url: '/images/products/security-camera.png', alt: 'Security Camera', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 60, trackInventory: true },
    ratings: { average: 4.3, count: 87 }
  },
  {
    name: 'Portable Bluetooth Speaker',
    slug: 'portable-bluetooth-speaker',
    description: 'Rugged waterproof bluetooth speaker with 360-degree sound.',
    sku: 'SPK-BT-001',
    price: 79.99,
    category: 'Electronics',
    brand: 'SoundWave',
    tags: ['speaker', 'bluetooth', 'audio', 'portable'],
    images: [
      { url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1', alt: 'Bluetooth Speaker', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 85, trackInventory: true },
    ratings: { average: 4.6, count: 156 }
  },
  {
    name: 'High-Performance Gaming Laptop',
    slug: 'high-performance-gaming-laptop',
    description: 'Powerful gaming laptop with RTX 4070, 32GB RAM, and 1TB SSD.',
    sku: 'LAP-GAME-001',
    price: 1899.99,
    category: 'Electronics',
    brand: 'TechMaster',
    tags: ['laptop', 'gaming', 'computer', 'performance'],
    images: [
      { url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302', alt: 'Gaming Laptop', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 15, trackInventory: true },
    isFeatured: true,
    ratings: { average: 4.9, count: 28 }
  },

  // Clothing
  {
    name: 'Classic Denim Jacket',
    slug: 'classic-denim-jacket',
    description: 'Timeless denim jacket made from premium quality fabric.',
    sku: 'CDJ-001',
    price: 79.99,
    category: 'Clothing',
    tags: ['denim', 'jacket', 'casual'],
    images: [
      { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5', alt: 'Denim jacket', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 100, trackInventory: true },
    ratings: { average: 4.4, count: 67 }
  },
  {
    name: 'Premium Cotton T-Shirt Set',
    slug: 'premium-cotton-t-shirt-set',
    description: 'Pack of 3 Essential cotton t-shirts in neutral colors (Black, White, Grey).',
    sku: 'TSH-SET-001',
    price: 49.99,
    category: 'Clothing',
    brand: 'Basics',
    tags: ['t-shirt', 'cotton', 'casual', 'basics'],
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', alt: 'T-Shirts', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 200, trackInventory: true },
    ratings: { average: 4.7, count: 450 }
  },
  {
    name: 'Slim Fit Chino Pants',
    slug: 'slim-fit-chino-pants',
    description: 'Comfortable slim fit chinos suitable for casual and semi-formal wear.',
    sku: 'CHI-001',
    price: 59.99,
    category: 'Clothing',
    brand: 'UrbanStyle',
    tags: ['pants', 'chinos', 'casual', 'men'],
    images: [
      { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a', alt: 'Chino Pants', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 120, trackInventory: true },
    ratings: { average: 4.3, count: 89 }
  },
  {
    name: 'Waterproof Hiking Jacket',
    slug: 'waterproof-hiking-jacket',
    description: 'All-weather waterproof jacket with breathable fabric for outdoor adventures.',
    sku: 'JKT-HIKE-001',
    price: 129.99,
    category: 'Clothing',
    brand: 'NorthPeak',
    tags: ['jacket', 'hiking', 'outdoor', 'waterproof'],
    images: [
      { url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3', alt: 'Hiking Jacket', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 45, trackInventory: true },
    isFeatured: true,
    ratings: { average: 4.8, count: 112 }
  },
  {
    name: 'Casual Canvas Sneakers',
    slug: 'casual-canvas-sneakers',
    description: 'Classic low-top canvas sneakers for everyday comfort.',
    sku: 'SNK-CNV-001',
    price: 45.99,
    category: 'Clothing',
    brand: 'WalkEasy',
    tags: ['shoes', 'sneakers', 'casual', 'footwear'],
    images: [
      { url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77', alt: 'Sneakers', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 150, trackInventory: true },
    ratings: { average: 4.5, count: 230 }
  },
  {
    name: 'Formal Leather Oxford Shoes',
    slug: 'formal-leather-oxford-shoes',
    description: 'Elegant genuine leather Oxford shoes for formal occasions.',
    sku: 'SHO-OX-001',
    price: 119.99,
    category: 'Clothing',
    brand: 'GentlemanCreate',
    tags: ['shoes', 'formal', 'leather', 'office'],
    images: [
      { url: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1', alt: 'Oxford Shoes', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 40, trackInventory: true },
    ratings: { average: 4.6, count: 45 }
  },
  {
    name: 'Summer Floral Dress',
    slug: 'summer-floral-dress',
    description: 'Light and breezy floral print dress perfect for summer days.',
    sku: 'DRS-FLO-001',
    price: 69.99,
    category: 'Clothing',
    brand: 'SunnyWear',
    tags: ['dress', 'summer', 'floral', 'women'],
    images: [
      { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1', alt: 'Floral Dress', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 80, trackInventory: true },
    isFeatured: true,
    ratings: { average: 4.7, count: 156 }
  },
  {
    name: 'Wool Blend Trench Coat',
    slug: 'wool-blend-trench-coat',
    description: 'Classic beige trench coat made from warmth wool blend.',
    sku: 'COAT-TR-001',
    price: 199.99,
    category: 'Clothing',
    brand: 'Elegance',
    tags: ['coat', 'winter', 'fashion', 'outerwear'],
    images: [
      { url: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543', alt: 'Trench Coat', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 25, trackInventory: true },
    ratings: { average: 4.8, count: 34 }
  },

  // Books
  {
    name: 'Mystery Novel Collection',
    slug: 'mystery-novel-collection',
    description: 'Collection of bestselling mystery novels from renowned authors.',
    sku: 'MNC-001',
    price: 34.99,
    category: 'Books',
    tags: ['books', 'mystery', 'fiction'],
    images: [
      { url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e', alt: 'Books', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 150, trackInventory: true },
    ratings: { average: 4.5, count: 450 }
  },
  {
    name: 'The Art of Programming',
    slug: 'the-art-of-programming',
    description: 'Comprehensive guide to software development principles and practices.',
    sku: 'BK-PROG-001',
    price: 54.99,
    category: 'Books',
    tags: ['books', 'technology', 'programming', 'education'],
    images: [
      { url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765', alt: 'Programming Book', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 100, trackInventory: true },
    ratings: { average: 4.9, count: 120 }
  },
  {
    name: 'Modern Cooking Guide',
    slug: 'modern-cooking-guide',
    description: 'Over 500 recipes for modern home cooking with fresh ingredients.',
    sku: 'BK-COOK-001',
    price: 39.99,
    category: 'Books',
    tags: ['books', 'cooking', 'recipes', 'food'],
    images: [
      { url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73', alt: 'Cookbook', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 75, trackInventory: true },
    isFeatured: true,
    ratings: { average: 4.7, count: 340 }
  },
  {
    name: 'Science Fiction Anthology',
    slug: 'science-fiction-anthology',
    description: 'A collection of the greatest sci-fi short stories of the 21st century.',
    sku: 'BK-SCIFI-001',
    price: 29.99,
    category: 'Books',
    tags: ['books', 'scifi', 'fiction'],
    images: [
      { url: 'https://images.unsplash.com/photo-1614544048536-0d28caf77f41', alt: 'Sci-Fi Book', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 120, trackInventory: true },
    ratings: { average: 4.6, count: 89 }
  },
  {
    name: 'History of World Civilizations',
    slug: 'history-of-world-civilizations',
    description: 'An in-depth look at the rise and fall of major world civilizations.',
    sku: 'BK-HIST-001',
    price: 45.99,
    category: 'Books',
    tags: ['books', 'history', 'education'],
    images: [
      { url: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744', alt: 'History Book', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 60, trackInventory: true },
    ratings: { average: 4.4, count: 56 }
  },
  {
    name: 'Self-Improvement Mastery',
    slug: 'self-improvement-mastery',
    description: 'Practical strategies for personal growth and productivity.',
    sku: 'BK-SELF-001',
    price: 24.99,
    category: 'Books',
    tags: ['books', 'self-help', 'productivity'],
    images: [
      { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', alt: 'Self Help Book', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 200, trackInventory: true },
    ratings: { average: 4.8, count: 560 }
  },
  {
    name: 'Beginner\'s Guide to Gardening',
    slug: 'beginners-guide-to-gardening',
    description: 'Step-by-step guide to starting your own home garden.',
    sku: 'BK-GARD-001',
    price: 27.99,
    category: 'Books',
    tags: ['books', 'gardening', 'home'],
    images: [
      { url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae', alt: 'Gardening Book', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 80, trackInventory: true },
    ratings: { average: 4.5, count: 78 }
  },
  {
    name: 'Financial Freedom Strategies',
    slug: 'financial-freedom-strategies',
    description: 'Learn how to manage money, invest wisely, and build wealth.',
    sku: 'BK-FIN-001',
    price: 32.99,
    category: 'Books',
    tags: ['books', 'finance', 'money', 'business'],
    images: [
      { url: '/images/products/financial-book.png', alt: 'Finance Book', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 90, trackInventory: true },
    isFeatured: true,
    ratings: { average: 4.9, count: 210 }
  },

  // Home & Garden
  {
    name: 'Indoor Plant Set',
    slug: 'indoor-plant-set',
    description: 'Beautiful set of low-maintenance indoor plants perfect for home decoration.',
    sku: 'IPS-001',
    price: 49.99,
    category: 'Home & Garden',
    tags: ['plants', 'home', 'decoration'],
    images: [
      { url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411', alt: 'Indoor plants', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 40, trackInventory: true },
    ratings: { average: 4.7, count: 112 }
  },
  {
    name: 'Ergonomic Office Chair',
    slug: 'ergonomic-office-chair',
    description: 'Comfortable mesh office chair with lumbar support and adjustable height.',
    sku: 'CHR-OFF-001',
    price: 199.99,
    category: 'Home & Garden',
    tags: ['furniture', 'office', 'chair', 'home'],
    images: [
      { url: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1', alt: 'Office Chair', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 30, trackInventory: true },
    isFeatured: true,
    ratings: { average: 4.5, count: 89 }
  },
  {
    name: 'Automatic Coffee Maker',
    slug: 'automatic-coffee-maker',
    description: 'Programmable coffee maker with built-in grinder for fresh brew every morning.',
    sku: 'APP-COF-001',
    price: 89.99,
    category: 'Home & Garden',
    tags: ['appliance', 'kitchen', 'coffee', 'home'],
    images: [
      { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', alt: 'Coffee Maker', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 50, trackInventory: true },
    ratings: { average: 4.6, count: 230 }
  },
  {
    name: 'Smart LED Bulb Pack',
    slug: 'smart-led-bulb-pack',
    description: 'Pack of 4 WiFi-enabled color changing LED bulbs compatible with voice assistants.',
    sku: 'LGT-SMT-001',
    price: 39.99,
    category: 'Home & Garden',
    tags: ['lighting', 'smart home', 'led', 'home'],
    images: [
      { url: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2', alt: 'LED Bulbs', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 150, trackInventory: true },
    ratings: { average: 4.4, count: 340 }
  },
  {
    name: 'Ceramic Dinnerware Set',
    slug: 'ceramic-dinnerware-set',
    description: 'Elegant 16-piece stoneware dinner set service for 4.',
    sku: 'KIT-DIN-001',
    price: 69.99,
    category: 'Home & Garden',
    tags: ['kitchen', 'dining', 'tableware'],
    images: [
      { url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa', alt: 'Dinnerware', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 40, trackInventory: true },
    ratings: { average: 4.8, count: 67 }
  },
  {
    name: 'Soft Memory Foam Pillow',
    slug: 'soft-memory-foam-pillow',
    description: 'Orthopedic cervical pillow for neck pain relief and better sleep.',
    sku: 'BED-PIL-001',
    price: 29.99,
    category: 'Home & Garden',
    tags: ['bedroom', 'sleep', 'comfort', 'home'],
    images: [
      { url: '/images/products/pillow.png', alt: 'Pillow', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 100, trackInventory: true },
    ratings: { average: 4.5, count: 450 }
  },
  {
    name: 'Robotic Vacuum Cleaner',
    slug: 'robotic-vacuum-cleaner',
    description: 'Smart robot vacuum with app control and self-charging capability.',
    sku: 'APP-VAC-001',
    price: 249.99,
    category: 'Home & Garden',
    tags: ['appliance', 'cleaning', 'smart home', 'robot'],
    images: [
      { url: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73', alt: 'Robot Vacuum', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 25, trackInventory: true },
    isFeatured: true,
    ratings: { average: 4.7, count: 120 }
  },
  {
    name: 'Minimalist Floor Lamp',
    slug: 'minimalist-floor-lamp',
    description: 'Modern standing floor lamp with adjustable head and warm LED light.',
    sku: 'LGT-LAP-001',
    price: 79.99,
    category: 'Home & Garden',
    tags: ['lighting', 'decor', 'furniture', 'home'],
    images: [
      { url: '/images/products/floor-lamp.png', alt: 'Floor Lamp', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 45, trackInventory: true },
    ratings: { average: 4.6, count: 89 }
  },

  // Sports
  {
    name: 'Running Shoes Ultra',
    slug: 'running-shoes-ultra',
    description: 'Lightweight running shoes with superior cushioning and breathability.',
    sku: 'RSU-001',
    price: 89.99,
    category: 'Sports',
    brand: 'RunFast',
    tags: ['running', 'shoes', 'sports'],
    images: [
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', alt: 'Running shoes', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 75, trackInventory: true },
    isFeatured: true,
    ratings: { average: 4.7, count: 134 }
  },
  {
    name: 'Yoga Mat Premium',
    slug: 'yoga-mat-premium',
    description: 'Extra thick, non-slip yoga mat with carrying strap.',
    sku: 'YMP-001',
    price: 39.99,
    category: 'Sports',
    tags: ['yoga', 'fitness', 'exercise'],
    images: [
      { url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f', alt: 'Yoga mat', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 60, trackInventory: true },
    ratings: { average: 4.8, count: 210 }
  },
  {
    name: 'Adjustable Dumbbell Set',
    slug: 'adjustable-dumbbell-set',
    description: 'Pair of adjustable dumbbells ranging from 5 to 52.5 lbs each.',
    sku: 'GYM-WGT-001',
    price: 299.99,
    category: 'Sports',
    tags: ['fitness', 'gym', 'weights', 'exercise'],
    images: [
      { url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61', alt: 'Dumbbells', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 15, trackInventory: true },
    isFeatured: true,
    ratings: { average: 4.9, count: 45 }
  },
  {
    name: 'Professional Tennis Racket',
    slug: 'professional-tennis-racket',
    description: 'Lightweight graphite tennis racket for intermediate to advanced players.',
    sku: 'SPT-TEN-001',
    price: 129.99,
    category: 'Sports',
    tags: ['tennis', 'sports', 'racket', 'outdoor'],
    images: [
      { url: '/images/products/tennis-racket.png', alt: 'Tennis Racket', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 40, trackInventory: true },
    ratings: { average: 4.6, count: 23 }
  },
  {
    name: 'Camping Tent for 4 Persons',
    slug: 'camping-tent-for-4-persons',
    description: 'Waterproof family camping tent, easy setup and durable design.',
    sku: 'OUT-TEN-001',
    price: 149.99,
    category: 'Sports',
    tags: ['camping', 'outdoor', 'tent', 'nature'],
    images: [
      { url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d', alt: 'Camping Tent', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 20, trackInventory: true },
    isFeatured: true,
    ratings: { average: 4.7, count: 67 }
  },
  {
    name: 'Smart Fitness Tracker',
    slug: 'smart-fitness-tracker',
    description: 'Track your steps, heart rate, and sleep with this slim fitness band.',
    sku: 'FIT-TRK-001',
    price: 49.99,
    category: 'Sports',
    tags: ['fitness', 'technology', 'wearable', 'health'],
    images: [
      { url: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288', alt: 'Fitness Tracker', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 100, trackInventory: true },
    ratings: { average: 4.4, count: 340 }
  },
  {
    name: 'Resistance Bands Set',
    slug: 'resistance-bands-set',
    description: 'Set of 5 resistance bands with different levels for full body workout.',
    sku: 'GYM-BND-001',
    price: 19.99,
    category: 'Sports',
    tags: ['fitness', 'exercise', 'gym', 'home'],
    images: [
      { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48', alt: 'Resistance Bands', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 200, trackInventory: true },
    ratings: { average: 4.6, count: 560 }
  },
  {
    name: 'Cycling Helmet',
    slug: 'cycling-helmet',
    description: 'Aerodynamic road cycling helmet with superior ventilation and safety.',
    sku: 'CYC-HLM-001',
    price: 64.99,
    category: 'Sports',
    tags: ['cycling', 'bike', 'safety', 'helmet'],
    images: [
      { url: '/images/products/cycling-helmet.png', alt: 'Cycling Helmet', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 50, trackInventory: true },
    ratings: { average: 4.8, count: 89 }
  },
  {
    name: 'Basketball Pro Ball',
    slug: 'basketball-pro-ball',
    description: 'Official size and weight indoor/outdoor basketball with excellent grip.',
    sku: 'SPT-BB-001',
    price: 29.99,
    category: 'Sports',
    tags: ['basketball', 'sports', 'ball', 'game'],
    images: [
      { url: 'https://images.unsplash.com/photo-1518407613690-d9fc990e795f', alt: 'Basketball', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 80, trackInventory: true },
    ratings: { average: 4.7, count: 210 }
  }
];

const users = [
  {
    email: 'admin@ecommerce.com',
    password: 'Admin@123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isEmailVerified: true,
  },
  {
    email: 'customer@ecommerce.com',
    password: 'Customer@123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'customer',
    isEmailVerified: true,
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Seed Products Database
    console.log('📦 Seeding Products Database...');
    const productsConn = await mongoose.createConnection(dbConfigs.products).asPromise();

    const CategorySchema = new mongoose.Schema({
      name: String,
      slug: String,
      description: String,
      isActive: { type: Boolean, default: true },
      order: Number,
      productCount: { type: Number, default: 0 },
    }, { timestamps: true });

    const ProductSchema = new mongoose.Schema({
      name: String,
      slug: String,
      description: String,
      shortDescription: String,
      sku: String,
      price: Number,
      compareAtPrice: Number,
      costPrice: Number,
      category: String,
      subcategory: String,
      brand: String,
      tags: [String],
      images: [{
        url: String,
        alt: String,
        isPrimary: Boolean,
        order: Number,
      }],
      inventory: {
        quantity: Number,
        reservedQuantity: { type: Number, default: 0 },
        lowStockThreshold: { type: Number, default: 10 },
        trackInventory: { type: Boolean, default: true },
        allowBackorder: { type: Boolean, default: false },
      },
      specifications: mongoose.Schema.Types.Mixed,
      ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
      },
      isActive: { type: Boolean, default: true },
      isFeatured: { type: Boolean, default: false },
    }, { timestamps: true });

    const Category = productsConn.model('Category', CategorySchema);
    const Product = productsConn.model('Product', ProductSchema);

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Insert categories
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Insert products
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    // Update category product counts
    console.log('🔄 Updating category product counts...');
    for (const category of insertedCategories) {
      const count = await Product.countDocuments({ category: category.name });
      await Category.findByIdAndUpdate(category._id, { productCount: count });
      console.log(`   - ${category.name}: ${count} products`);
    }

    await productsConn.close();

    // Seed Users Database
    console.log('\n👥 Seeding Users Database...');
    const usersConn = await mongoose.createConnection(dbConfigs.users).asPromise();

    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: String,
      lastName: String,
      phone: String,
      role: { type: String, enum: ['customer', 'admin', 'vendor'], default: 'customer' },
      isEmailVerified: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
      addresses: [{ type: mongoose.Schema.Types.Mixed }],
    }, { timestamps: true });

    const User = usersConn.model('User', UserSchema);

    // Clear existing users
    await User.deleteMany({});

    // Hash passwords and insert users
    for (const user of users) {
      user.password = await bcrypt.hash(user.password, 10);
    }

    const insertedUsers = await User.insertMany(users);
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    await usersConn.close();

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Email: admin@ecommerce.com');
    console.log('  Password: Admin@123');
    console.log('\nCustomer:');
    console.log('  Email: customer@example.com');
    console.log('  Password: Customer@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
