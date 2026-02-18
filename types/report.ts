// Report types

export interface RevenueReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  periodStart: string;
  periodEnd: string;
}

export interface CostReport {
  totalImportCost: number;
  totalImports: number;
  periodStart: string;
  periodEnd: string;
}

export interface ProfitReport {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  periodStart: string;
  periodEnd: string;
}

export interface OrdersStatsReport {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  doneOrders: number;
  cancelledOrders: number;
  periodStart: string;
  periodEnd: string;
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
  periodStart: string;
  periodEnd: string;
}

export interface DailyRevenueItem {
  date: string;
  revenue: number;
  orders: number;
}

export interface DailyRevenueReport {
  data: DailyRevenueItem[];
  periodStart: string;
  periodEnd: string;
}
