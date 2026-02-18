"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRevenueReport,
  useOrdersStatsReport,
  useProfitReport,
  useCostsReport,
} from "@/hooks/api/use-reports";
import { Period } from "./analytics-chart";

interface AnalyticsSummaryProps {
  period: Period;
  dateRange: { from: string; to: string };
}

const periodLabels = {
  daily: "Tuần này",
  monthly: "Năm nay",
  yearly: "3 năm qua",
};

export function AnalyticsSummary({ period, dateRange }: AnalyticsSummaryProps) {
  const { data: revenueData, isLoading: revenueLoading } =
    useRevenueReport(dateRange);
  const { data: ordersStats, isLoading: ordersLoading } =
    useOrdersStatsReport(dateRange);
  const { data: profitData, isLoading: profitLoading } =
    useProfitReport(dateRange);
  const { data: costsData, isLoading: costsLoading } =
    useCostsReport(dateRange);

  const isLoading =
    revenueLoading || ordersLoading || profitLoading || costsLoading;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate profit margin
  const profitMargin =
    profitData?.totalRevenue && profitData?.grossProfit
      ? (profitData.grossProfit / profitData.totalRevenue) * 100
      : 0;

  // Calculate cancellation rate
  const cancelRate =
    ordersStats?.totalOrders && ordersStats?.cancelledOrders
      ? ((ordersStats.cancelledOrders / ordersStats.totalOrders) * 100).toFixed(
          1,
        )
      : "0";

  const periodLabel = periodLabels[period] || "Tuần này";

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tổng doanh thu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-28 mb-2" />
              <Skeleton className="h-4 w-20" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-foreground">
                {formatPrice(revenueData?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {periodLabel}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Lợi nhuận
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-28 mb-2" />
              <Skeleton className="h-4 w-20" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(profitData?.grossProfit || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Biên lợi nhuận: {profitMargin.toFixed(1)}%
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tổng đơn hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-24" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-foreground">
                {ordersStats?.totalOrders || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {ordersStats?.doneOrders || 0} đã hoàn thành
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Chi phí nhập
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-28 mb-2" />
              <Skeleton className="h-4 w-20" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-orange-600">
                {formatPrice(costsData?.totalImportCost || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {costsData?.totalImports || 0} lần nhập hàng
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tỷ lệ hủy đơn
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </>
          ) : (
            <>
              <div
                className={`text-2xl font-bold ${Number(cancelRate) > 5 ? "text-destructive" : "text-foreground"}`}
              >
                {cancelRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {ordersStats?.cancelledOrders || 0} đơn đã hủy
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
