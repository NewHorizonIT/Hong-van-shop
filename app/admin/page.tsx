"use client";

import { useMemo } from "react";
import { AnalyticsCharts } from "@/components/common/analytics-chart";
import { KPICards } from "@/components/common/kpi-card";
import { getDateRange } from "@/hooks/api/use-reports";

export default function AdminPage() {
  const weekRange = useMemo(() => getDateRange("week"), []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>
      <KPICards />
      <AnalyticsCharts period="daily" dateRange={weekRange} />
    </div>
  );
}
