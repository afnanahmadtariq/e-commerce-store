/**
 * Database Seed Script
 * Run with: npm run db:seed
 * 
 * This script populates the database with sample data for testing.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

// Sample data
const users = [
  {
    email: 'admin@ecommerce.com',
    password: 'Admin@123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    isVerified: true,
  },
  {
    email: 'vendor@ecommerce.com',
    password: 'Vendor@123',
    firstName: 'John',
    lastName: 'Vendor',
    role: 'vendor',
    isActive: true,
    isVerified: true,
  },
  {
    email: 'customer@ecommerce.com',
    password: 'Customer@123',
    firstName: 'Jane',
    lastName: 'Customer',
    role: 'customer',
    isActive: true,
    isVerified: true,
    addresses: [
      {
        type: 'home',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        isDefault: true,
      },
    ],
  },
];

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets', order: 1 },
  { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel', order: 2 },
  { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and gardening', order: 3 },
  { name: 'Sports', slug: 'sports', description: 'Sports equipment and accessories', order: 4 },
  { name: 'Books', slug: 'books', description: 'Books and publications', order: 5 },
];

const products = [
  {
    name: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
    shortDescription: 'Premium ANC headphones',
    sku: 'WBH-001',
    price: 149.99,
    compareAtPrice: 199.99,
    category: 'electronics',
    brand: 'TechSound',
    tags: ['headphones', 'wireless', 'bluetooth', 'audio'],
    images: [
      { url: 'https://via.placeholder.com/400x400?text=Headphones', alt: 'Wireless Headphones', isPrimary: true, order: 0 },
    ],
    inventory: { quantity: 100, lowStockThreshold: 10, trackInventory: true },
    ratings: { average: 4.5, count: 128 },
    isFeatured: true,
  },
  {
    name: 'Smart Watch Pro',
    slug: 'smart-watch-pro',
    description: 'Advanced smartwatch with health monitoring, GPS, and 7-day battery life.',
    shortDescription: 'Advanced health smartwatch',
    sku: 'SWP-002',
    price: 299.99,
    category: 'electronics',
    brand: 'TechWear',
    tags: ['smartwatch', 'fitness', 'health', 'wearable'],
    images: [
      { url: 'https://via.placeholder.com/400x400?text=SmartWatch', alt: 'Smart Watch Pro', isPrimary: true, order: 0 },
    ],
    inventory: { quantity: 50, lowStockThreshold: 5, trackInventory: true },
    ratings: { average: 4.8, count: 256 },
    isFeatured: true,
  },
  {
    name: 'Men\'s Classic Cotton T-Shirt',
    slug: 'mens-classic-cotton-tshirt',
    description: 'Comfortable 100% cotton t-shirt in classic fit. Available in multiple colors.',
    shortDescription: 'Classic fit cotton tee',
    sku: 'MCT-003',
    price: 24.99,
    compareAtPrice: 34.99,
    category: 'clothing',
    brand: 'ComfortWear',
    tags: ['tshirt', 'cotton', 'mens', 'casual'],
    images: [
      { url: 'https://via.placeholder.com/400x400?text=TShirt', alt: 'Classic T-Shirt', isPrimary: true, order: 0 },
    ],
    variants: [
      { name: 'Small - Black', sku: 'MCT-003-S-BLK', price: 24.99, inventory: 20, attributes: { size: 'S', color: 'Black' } },
      { name: 'Medium - Black', sku: 'MCT-003-M-BLK', price: 24.99, inventory: 30, attributes: { size: 'M', color: 'Black' } },
      { name: 'Large - Black', sku: 'MCT-003-L-BLK', price: 24.99, inventory: 25, attributes: { size: 'L', color: 'Black' } },
    ],
    inventory: { quantity: 200, lowStockThreshold: 20, trackInventory: true },
    ratings: { average: 4.2, count: 89 },
  },
  {
    name: 'Yoga Mat Premium',
    slug: 'yoga-mat-premium',
    description: 'Eco-friendly yoga mat with excellent grip and cushioning. 6mm thick.',
    shortDescription: 'Eco-friendly yoga mat',
    sku: 'YMP-004',
    price: 49.99,
    category: 'sports',
    brand: 'ZenFit',
    tags: ['yoga', 'fitness', 'eco-friendly', 'exercise'],
    images: [
      { url: 'https://via.placeholder.com/400x400?text=YogaMat', alt: 'Yoga Mat Premium', isPrimary: true, order: 0 },
    ],
    inventory: { quantity: 75, lowStockThreshold: 10, trackInventory: true },
    ratings: { average: 4.6, count: 167 },
    isFeatured: true,
  },
  {
    name: 'Bestseller Mystery Novel',
    slug: 'bestseller-mystery-novel',
    description: 'The latest thriller from a bestselling author. A gripping tale of mystery and suspense.',
    shortDescription: 'Gripping mystery thriller',
    sku: 'BMN-005',
    price: 14.99,
    compareAtPrice: 19.99,
    category: 'books',
    brand: 'Reader\'s Choice',
    tags: ['book', 'mystery', 'thriller', 'fiction'],
    images: [
      { url: 'https://via.placeholder.com/400x400?text=Book', alt: 'Mystery Novel', isPrimary: true, order: 0 },
    ],
    inventory: { quantity: 150, lowStockThreshold: 15, trackInventory: true },
    ratings: { average: 4.4, count: 312 },
  },
];

const coupons = [
  {
    code: 'WELCOME10',
    description: '10% off your first order',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 50,
    maxDiscountAmount: 20,
    usageLimit: 1000,
    perUserLimit: 1,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    isActive: true,
  },
  {
    code: 'SAVE20',
    description: '$20 off orders over $100',
    discountType: 'fixed',
    discountValue: 20,
    minOrderAmount: 100,
    usageLimit: 500,
    perUserLimit: 3,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isActive: true,
  },
  {
    code: 'FREESHIP',
    description: 'Free shipping on orders over $50',
    discountType: 'fixed',
    discountValue: 5.99,
    minOrderAmount: 50,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get database
    const db = mongoose.connection.db;

    // Clear existing data
    console.log('\nClearing existing data...');
    await db.collection('users').deleteMany({});
    await db.collection('categories').deleteMany({});
    await db.collection('products').deleteMany({});
    await db.collection('carts').deleteMany({});
    await db.collection('coupons').deleteMany({});
    await db.collection('orders').deleteMany({});
    await db.collection('sessions').deleteMany({});
    await db.collection('reviews').deleteMany({});

    // Seed users
    console.log('Seeding users...');
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12),
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    await db.collection('users').insertMany(hashedUsers);
    console.log(`  ✓ Created ${users.length} users`);

    // Seed categories
    console.log('Seeding categories...');
    const categoriesWithTimestamps = categories.map((cat) => ({
      ...cat,
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await db.collection('categories').insertMany(categoriesWithTimestamps);
    console.log(`  ✓ Created ${categories.length} categories`);

    // Seed products
    console.log('Seeding products...');
    const productsWithTimestamps = products.map((product) => ({
      ...product,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await db.collection('products').insertMany(productsWithTimestamps);
    console.log(`  ✓ Created ${products.length} products`);

    // Update category product counts
    for (const cat of categories) {
      const count = products.filter((p) => p.category === cat.slug).length;
      await db.collection('categories').updateOne(
        { slug: cat.slug },
        { $set: { productCount: count } }
      );
    }

    // Seed coupons
    console.log('Seeding coupons...');
    const couponsWithTimestamps = coupons.map((coupon) => ({
      ...coupon,
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await db.collection('coupons').insertMany(couponsWithTimestamps);
    console.log(`  ✓ Created ${coupons.length} coupons`);

    // Create indexes
    console.log('\nCreating indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('products').createIndex({ slug: 1 }, { unique: true });
    await db.collection('products').createIndex({ sku: 1 }, { unique: true });
    await db.collection('products').createIndex({ name: 'text', description: 'text', tags: 'text' });
    await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
    await db.collection('coupons').createIndex({ code: 1 }, { unique: true });
    console.log('  ✓ Indexes created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('  Admin:    admin@ecommerce.com / Admin@123');
    console.log('  Vendor:   vendor@ecommerce.com / Vendor@123');
    console.log('  Customer: customer@ecommerce.com / Customer@123');
    console.log('\n🎟️  Test Coupons: WELCOME10, SAVE20, FREESHIP\n');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();
