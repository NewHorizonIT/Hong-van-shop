"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  useDailyRevenueReport,
  useOrdersStatsReport,
} from "@/hooks/api/use-reports";

export type Period = "daily" | "monthly" | "yearly";

interface AnalyticsChartsProps {
  period: Period;
  dateRange: { from: string; to: string };
}

const periodLabels = {
  daily: "ngày",
  monthly: "tháng",
  yearly: "năm",
};

export function AnalyticsCharts({ period, dateRange }: AnalyticsChartsProps) {
  const { data: dailyRevenue, isLoading: revenueLoading } =
    useDailyRevenueReport(dateRange);
  const { data: ordersStats, isLoading: ordersLoading } =
    useOrdersStatsReport(dateRange);

  const isLoading = revenueLoading || ordersLoading;

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  // Transform daily revenue data for chart
  const revenueChartData =
    dailyRevenue?.data?.map((item) => ({
      date: new Date(item.date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      revenue: item.revenue,
      cost: item.cost,
      profit: item.profit,
      orders: item.orders,
    })) || [];

  // Create orders data for bar chart
  const ordersChartData =
    dailyRevenue?.data?.map((item) => ({
      date: new Date(item.date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      orders: item.orders,
      cancelled: 0, // We don't have cancelled count per day in current API
    })) || [];

  const periodLabel = periodLabels[period] || "ngày";

  return (
    <div className="grid gap-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Xu hướng doanh thu</CardTitle>
          <CardDescription>
            Doanh thu, chi phí và lợi nhuận theo {periodLabel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis
                  stroke="var(--muted-foreground)"
                  tickFormatter={formatPrice}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: `1px solid var(--border)`,
                  }}
                  formatter={(value: number, name: string) => {
                    const formatted = new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(value || 0);
                    return [formatted, name];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="#3b82f6"
                  dot={{ fill: "#3b82f6" }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  name="Chi phí nhập"
                  stroke="#f97316"
                  dot={{ fill: "#f97316" }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Lợi nhuận"
                  stroke="#22c55e"
                  dot={{ fill: "#22c55e" }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Không có dữ liệu trong khoảng thời gian này
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Đơn hàng & Hủy</CardTitle>
          <CardDescription>
            Khối lượng đơn hàng theo {periodLabel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : ordersChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: `1px solid var(--border)`,
                  }}
                />
                <Legend />
                <Bar
                  dataKey="orders"
                  name="Đơn hàng"
                  fill="var(--primary)"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="cancelled"
                  name="Đã hủy"
                  fill="var(--destructive)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Không có dữ liệu trong khoảng thời gian này
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
