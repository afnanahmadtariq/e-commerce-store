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
  },
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
  },
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
  },
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
  },
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
  },
  {
    name: 'Laptop Backpack Pro',
    slug: 'laptop-backpack-pro',
    description: 'Durable laptop backpack with multiple compartments and USB charging port.',
    sku: 'LBP-001',
    price: 59.99,
    category: 'Electronics',
    tags: ['backpack', 'laptop', 'travel'],
    images: [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', alt: 'Laptop backpack', isPrimary: true, order: 0 }
    ],
    inventory: { quantity: 80, trackInventory: true },
  },
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
    email: 'customer@example.com',
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
