"use client";

import useSWR, { SWRConfiguration } from "swr";
import { fetcher, ApiError } from "@/lib/api-client";
import {
  RevenueReport,
  CostReport,
  ProfitReport,
  OrdersStatsReport,
  TopProductsReport,
  DailyRevenueReport,
} from "@/types/report";

interface ReportParams {
  from: string;
  to: string;
}

function buildQuery(params: ReportParams): string {
  return `?from=${params.from}&to=${params.to}`;
}

// Common SWR config for report hooks - don't retry on auth errors
const reportSwrConfig: SWRConfiguration = {
  onErrorRetry: (error, _key, _config, _revalidate, { retryCount }) => {
    // Never retry on 401 or 403
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      return;
    }
    if (error?.status === 401 || error?.status === 403) {
      return;
    }
    // Max 2 retries for other errors
    if (retryCount >= 2) return;
  },
  revalidateOnFocus: false,
  dedupingInterval: 10000, // Dedupe requests within 10 seconds
  revalidateOnMount: true,
  refreshInterval: 0, // No auto refresh
};

export function useRevenueReport(params: ReportParams | null) {
  return useSWR<RevenueReport>(
    params ? `/reports/revenue${buildQuery(params)}` : null,
    fetcher,
    reportSwrConfig,
  );
}

export function useCostsReport(params: ReportParams | null) {
  return useSWR<CostReport>(
    params ? `/reports/costs${buildQuery(params)}` : null,
    fetcher,
    reportSwrConfig,
  );
}

export function useProfitReport(params: ReportParams | null) {
  return useSWR<ProfitReport>(
    params ? `/reports/profit${buildQuery(params)}` : null,
    fetcher,
    reportSwrConfig,
  );
}

export function useOrdersStatsReport(params: ReportParams | null) {
  return useSWR<OrdersStatsReport>(
    params ? `/reports/orders-stats${buildQuery(params)}` : null,
    fetcher,
    reportSwrConfig,
  );
}

export function useTopProductsReport(
  params: ReportParams | null,
  limit: number = 10,
) {
  return useSWR<TopProductsReport>(
    params ? `/reports/top-products${buildQuery(params)}&limit=${limit}` : null,
    fetcher,
    reportSwrConfig,
  );
}

export function useDailyRevenueReport(params: ReportParams | null) {
  return useSWR<DailyRevenueReport>(
    params ? `/reports/daily-revenue${buildQuery(params)}` : null,
    fetcher,
    reportSwrConfig,
  );
}

// Helper to get date range for common periods
// Converts local time boundaries to UTC for server queries
export function getDateRange(period: "today" | "week" | "month" | "year") {
  const now = new Date();

  let fromLocal: Date;
  let toLocal: Date;

  switch (period) {
    case "today":
      // Start of today in local timezone
      fromLocal = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
      );
      // End of today in local timezone
      toLocal = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );
      break;
    case "week": {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      fromLocal = new Date(
        weekAgo.getFullYear(),
        weekAgo.getMonth(),
        weekAgo.getDate(),
        0,
        0,
        0,
        0,
      );
      toLocal = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );
      break;
    }
    case "month":
      fromLocal = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      toLocal = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );
      break;
    case "year":
      fromLocal = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      toLocal = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );
      break;
  }

  // Convert to ISO strings (automatically converts to UTC)
  // The Date constructor with (year, month, date, ...) interprets as local time
  // toISOString() then converts to UTC representation
  return {
    from: fromLocal.toISOString(),
    to: toLocal.toISOString(),
  };
}
