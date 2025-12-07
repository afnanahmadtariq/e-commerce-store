import { Server as SocketServer, Socket } from 'socket.io';

export function setupCartSocket(io: SocketServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join cart room for real-time updates
    socket.on('cart:join', (cartId: string) => {
      socket.join(`cart:${cartId}`);
      console.log(`Client ${socket.id} joined cart room: ${cartId}`);
    });

    // Leave cart room
    socket.on('cart:leave', (cartId: string) => {
      socket.leave(`cart:${cartId}`);
      console.log(`Client ${socket.id} left cart room: ${cartId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return io;
}

// Socket event types for client reference
export const CartSocketEvents = {
  JOIN_CART: 'cart:join',
  LEAVE_CART: 'cart:leave',
  CART_UPDATED: 'cart:updated',
  ITEM_ADDED: 'cart:item_added',
  ITEM_REMOVED: 'cart:item_removed',
  ITEM_UPDATED: 'cart:item_updated',
  PRICE_CHANGED: 'cart:price_changed',
  STOCK_WARNING: 'cart:stock_warning',
  COUPON_APPLIED: 'cart:coupon_applied',
  COUPON_REMOVED: 'cart:coupon_removed',
  CART_CLEARED: 'cart:cleared',
} as const;
