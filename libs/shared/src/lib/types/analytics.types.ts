// Analytics Types for Admin Dashboard

export interface IDashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  averageOrderValue: number;
  aovChange: number;
  conversionRate: number;
  conversionChange: number;
}

export interface ISalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface IProductAnalytics {
  productId: string;
  name: string;
  slug: string;
  image: string;
  totalSold: number;
  revenue: number;
  views: number;
  conversionRate: number;
}

export interface ICategoryAnalytics {
  category: string;
  revenue: number;
  orderCount: number;
  productCount: number;
}

export interface ICustomerAnalytics {
  newCustomers: number;
  returningCustomers: number;
  totalCustomers: number;
  customerGrowth: number;
}

export interface IInventoryAlert {
  productId: string;
  name: string;
  sku: string;
  currentStock: number;
  threshold: number;
  status: 'low' | 'out_of_stock';
}

export interface IRecentOrder {
  orderId: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: Date;
}

export interface ISystemMetrics {
  activeUsers: number;
  requestsPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
}

export interface IAnalyticsDateRange {
  startDate: Date;
  endDate: Date;
  period: 'day' | 'week' | 'month' | 'year';
}

export interface ITopProduct {
  _id: string;
  name: string;
  image: string;
  sales: number;
  revenue: number;
}

export interface IRevenueByCategory {
  category: string;
  revenue: number;
  percentage: number;
}

// Real-time Analytics Events
export enum AnalyticsSocketEvents {
  DASHBOARD_UPDATE = 'analytics:dashboard_update',
  NEW_ORDER = 'analytics:new_order',
  INVENTORY_ALERT = 'analytics:inventory_alert',
  SYSTEM_METRICS = 'analytics:system_metrics',
  USER_ACTIVITY = 'analytics:user_activity',
}
