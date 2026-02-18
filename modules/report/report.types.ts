export interface RevenueReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface CostReport {
  totalImportCost: number;
  totalImports: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface ProfitReport {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface OrdersStatsReport {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  doneOrders: number;
  cancelledOrders: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface TopProductItem {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  variantUnit: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface TopProductsReport {
  products: TopProductItem[];
  periodStart: Date;
  periodEnd: Date;
}

export interface DailyRevenueItem {
  date: string;
  revenue: number;
  orders: number;
}

export interface DailyRevenueReport {
  data: DailyRevenueItem[];
  periodStart: Date;
  periodEnd: Date;
}
