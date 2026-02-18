import { prisma } from "@/lib/prisma";
import {
  RevenueReport,
  CostReport,
  ProfitReport,
  OrdersStatsReport,
  TopProductsReport,
  DailyRevenueReport,
} from "./report.types";

class ReportRepository {
  async getRevenue(from: Date, to: Date): Promise<RevenueReport> {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["CONFIRMED", "DONE"] },
        createdAt: { gte: from, lte: to },
      },
      select: {
        totalAmount: true,
      },
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount.toNumber(),
      0
    );
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      periodStart: from,
      periodEnd: to,
    };
  }

  async getCosts(from: Date, to: Date): Promise<CostReport> {
    const imports = await prisma.inventoryImport.findMany({
      where: {
        importDate: { gte: from, lte: to },
      },
      select: {
        quantity: true,
        importPrice: true,
      },
    });

    const totalImportCost = imports.reduce(
      (sum, imp) => sum + imp.quantity * imp.importPrice.toNumber(),
      0
    );

    return {
      totalImportCost,
      totalImports: imports.length,
      periodStart: from,
      periodEnd: to,
    };
  }

  async getProfit(from: Date, to: Date): Promise<ProfitReport> {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["CONFIRMED", "DONE"] },
        createdAt: { gte: from, lte: to },
      },
      select: {
        totalAmount: true,
        totalProfit: true,
        totalCost: true,
      },
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount.toNumber(),
      0
    );
    const grossProfit = orders.reduce(
      (sum, order) => sum + order.totalProfit.toNumber(),
      0
    );
    const totalCost = orders.reduce(
      (sum, order) => sum + order.totalCost.toNumber(),
      0
    );

    return {
      totalRevenue,
      totalCost,
      grossProfit,
      periodStart: from,
      periodEnd: to,
    };
  }

  async getOrdersStats(from: Date, to: Date): Promise<OrdersStatsReport> {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: from, lte: to },
      },
      select: {
        status: true,
      },
    });

    const stats = {
      totalOrders: orders.length,
      pendingOrders: 0,
      confirmedOrders: 0,
      doneOrders: 0,
      cancelledOrders: 0,
      periodStart: from,
      periodEnd: to,
    };

    orders.forEach((order) => {
      switch (order.status) {
        case "PENDING":
          stats.pendingOrders++;
          break;
        case "CONFIRMED":
          stats.confirmedOrders++;
          break;
        case "DONE":
          stats.doneOrders++;
          break;
        case "CANCELLED":
          stats.cancelledOrders++;
          break;
      }
    });

    return stats;
  }

  async getTopProducts(
    from: Date,
    to: Date,
    limit: number
  ): Promise<TopProductsReport> {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: { in: ["CONFIRMED", "DONE"] },
          createdAt: { gte: from, lte: to },
        },
      },
      select: {
        quantity: true,
        unitPrice: true,
        subtotal: true,
        productVariant: {
          select: {
            id: true,
            name: true,
            unit: true,
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Aggregate by variant
    const variantMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        variantId: string;
        variantName: string;
        variantUnit: string;
        totalQuantity: number;
        totalRevenue: number;
      }
    >();

    orderItems.forEach((item) => {
      const v = item.productVariant;
      const key = v.id;
      const existing = variantMap.get(key);
      const revenue = item.subtotal.toNumber();

      if (existing) {
        existing.totalQuantity += item.quantity;
        existing.totalRevenue += revenue;
      } else {
        variantMap.set(key, {
          productId: v.product.id,
          productName: v.product.name,
          variantId: v.id,
          variantName: v.name,
          variantUnit: v.unit,
          totalQuantity: item.quantity,
          totalRevenue: revenue,
        });
      }
    });

    const products = Array.from(variantMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);

    return {
      products,
      periodStart: from,
      periodEnd: to,
    };
  }

  async getDailyRevenue(from: Date, to: Date): Promise<DailyRevenueReport> {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["CONFIRMED", "DONE"] },
        createdAt: { gte: from, lte: to },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    // Aggregate by day
    const dayMap = new Map<string, { revenue: number; orders: number }>();

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      const existing = dayMap.get(dateKey);
      const revenue = order.totalAmount.toNumber();

      if (existing) {
        existing.revenue += revenue;
        existing.orders++;
      } else {
        dayMap.set(dateKey, { revenue, orders: 1 });
      }
    });

    // Fill in missing days
    const data: { date: string; revenue: number; orders: number }[] = [];
    const current = new Date(from);
    while (current <= to) {
      const dateKey = current.toISOString().split("T")[0];
      const dayData = dayMap.get(dateKey) || { revenue: 0, orders: 0 };
      data.push({ date: dateKey, ...dayData });
      current.setDate(current.getDate() + 1);
    }

    return {
      data,
      periodStart: from,
      periodEnd: to,
    };
  }
}

export const reportRepository = new ReportRepository();
