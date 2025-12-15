import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { cartRoutes } from './routes';
import { CartService } from './services';
import { setupCartSocket } from './socket';
import { AppError } from './AppError';

dotenv.config();

const host = process.env['HOST'] ?? 'localhost';
const port = process.env['PORT'] ? Number(process.env['PORT']) : 3003;
const dbName = process.env['DB_NAME'] || 'ecommerce_carts';
const baseUri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017';
const mongoUri = baseUri.includes('mongodb+srv')
  ? `${baseUri.replace(/\/[^/]*(\?|$)/, `/${dbName}$1`)}`
  : `${baseUri}/${dbName}`;

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env['CORS_ORIGIN'] || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Setup socket handlers
setupCartSocket(io);

// Set Socket.IO instance in CartService for real-time updates
CartService.setSocketServer(io);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // Higher limit for cart operations
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'cart-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    socketConnections: io.sockets.sockets.size,
  });
});

// Routes
app.use('/cart', cartRoutes);

// Error handler


// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error | AppError, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);

  const statusCode = (err as AppError).statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    httpServer.listen(port, host, () => {
      console.log(`[ Cart Service ] http://${host}:${port}`);
      console.log(`[ Socket.IO ] WebSocket server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  io.close();
  await mongoose.connection.close();
  process.exit(0);
});

startServer();
