"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  TrendingUp,
  Clock,
  Zap,
  Wallet,
  Receipt,
} from "lucide-react";
import {
  useRevenueReport,
  useOrdersStatsReport,
  useProfitReport,
  useCostsReport,
  getDateRange,
} from "@/hooks/api/use-reports";
import { useUpcomingOrders } from "@/hooks/api/use-orders";

export function KPICards() {
  const todayRange = useMemo(() => getDateRange("today"), []);

  const { data: revenueData, isLoading: revenueLoading } =
    useRevenueReport(todayRange);
  const { data: ordersStats, isLoading: ordersLoading } =
    useOrdersStatsReport(todayRange);
  const { data: upcomingOrders, isLoading: upcomingLoading } =
    useUpcomingOrders(2);
  const { data: profitData, isLoading: profitLoading } =
    useProfitReport(todayRange);
  const { data: costsData, isLoading: costsLoading } =
    useCostsReport(todayRange);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get processing orders count (PENDING + CONFIRMED)
  const processingCount = ordersStats
    ? (ordersStats.pendingOrders || 0) + (ordersStats.confirmedOrders || 0)
    : 0;

  const kpis = [
    {
      title: "Tổng đơn hàng hôm nay",
      value: ordersStats?.totalOrders?.toString() || "0",
      change: `${ordersStats?.doneOrders || 0} đã hoàn thành`,
      icon: ShoppingCart,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      isLoading: ordersLoading,
    },
    {
      title: "Doanh thu hôm nay",
      value: revenueData ? formatPrice(revenueData.totalRevenue) : "0₫",
      change: `${revenueData?.totalOrders || 0} đơn hàng`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-50",
      isLoading: revenueLoading,
    },
    {
      title: "Lợi nhuận hôm nay",
      value: profitData ? formatPrice(profitData.grossProfit) : "0₫",
      change: profitData
        ? `Doanh thu: ${formatPrice(profitData.totalRevenue)}`
        : "Chưa có dữ liệu",
      icon: Wallet,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      isLoading: profitLoading,
    },
    {
      title: "Chi phí nhập hôm nay",
      value: costsData ? formatPrice(costsData.totalImportCost) : "0₫",
      change: costsData
        ? `${costsData.totalImports} lần nhập hàng`
        : "Chưa có dữ liệu",
      icon: Receipt,
      color: "text-red-500",
      bgColor: "bg-red-50",
      isLoading: costsLoading,
    },
    {
      title: "Đơn hàng đang xử lý",
      value: processingCount.toString(),
      change: ordersStats?.pendingOrders
        ? `${ordersStats.pendingOrders} chờ xác nhận`
        : "Không có đơn chờ",
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      isLoading: ordersLoading,
    },
    {
      title: "Sắp giao (2h tới)",
      value: upcomingOrders?.length?.toString() || "0",
      change:
        upcomingOrders && upcomingOrders.length > 0
          ? "Chuẩn bị giao hàng"
          : "Không có đơn sắp giao",
      icon: Zap,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      isLoading: upcomingLoading,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card key={idx} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {kpi.isLoading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    {kpi.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {kpi.change}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
