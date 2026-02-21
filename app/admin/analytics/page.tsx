"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnalyticsSummary } from "@/components/common/analytics-summary";
import { AnalyticsCharts, Period } from "@/components/common/analytics-chart";
import { useExport } from "@/hooks/api/use-export";
import { getDateRange } from "@/hooks/api/use-reports";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("daily");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { exportRevenue } = useExport();

  const dateRange = useMemo(() => {
    switch (period) {
      case "daily":
        return getDateRange("week");
      case "monthly":
        return getDateRange("year");
      case "yearly": {
        const now = new Date();
        const threeYearsAgo = new Date(now.getFullYear() - 3, 0, 1);
        // Use stable date strings
        return {
          from: threeYearsAgo.toISOString().split("T")[0] + "T00:00:00.000Z",
          to: now.toISOString().split("T")[0] + "T23:59:59.999Z",
        };
      }
      default:
        return getDateRange("week");
    }
  }, [period]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportRevenue(dateRange);
      toast({
        title: "Xuất file thành công",
        description: "Đã tải xuống file báo cáo",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xuất file. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Thống kê</h1>
        <div className="flex items-center gap-2">
          <Select
            value={period}
            onValueChange={(value: Period) => setPeriod(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Hằng ngày</SelectItem>
              <SelectItem value="monthly">Tháng</SelectItem>
              <SelectItem value="yearly">Năm</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Đang xuất..." : "Xuất báo cáo"}
          </Button>
        </div>
      </div>

      <AnalyticsSummary period={period} dateRange={dateRange} />
      <AnalyticsCharts period={period} dateRange={dateRange} />
    </div>
  );
}
