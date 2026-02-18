import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Period } from "@/components/common/analytics-chart";

export interface RevenueReportData {
  period: Period;
  summary: {
    totalRevenue: string;
    totalOrders: number;
    cancelRate: string;
  };
  chartData: Array<{
    label: string;
    revenue: number;
    orders: number;
    cancelled: number;
  }>;
}

/**
 * Export revenue report to Excel file
 */
export function exportRevenueReport(data: RevenueReportData): string {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ["Báo cáo Doanh thu"],
    [""],
    ["Kỳ báo cáo", getPeriodLabel(data.period)],
    ["Ngày xuất", new Date().toLocaleDateString("vi-VN")],
    [""],
    ["Tổng quan"],
    ["Tổng doanh thu", data.summary.totalRevenue],
    ["Tổng đơn hàng", data.summary.totalOrders],
    ["Tỷ lệ huỷ đơn", data.summary.cancelRate],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Set column widths
  summarySheet["!cols"] = [{ wch: 20 }, { wch: 25 }];

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Tổng quan");

  // Sheet 2: Detailed Data
  const headers = [
    getTimeColumnHeader(data.period),
    "Doanh thu (VND)",
    "Số đơn hàng",
    "Đơn bị huỷ",
    "Tỷ lệ huỷ (%)",
  ];

  const detailedData = data.chartData.map((item) => [
    item.label,
    item.revenue,
    item.orders,
    item.cancelled,
    item.orders > 0 ? ((item.cancelled / item.orders) * 100).toFixed(2) : "0",
  ]);

  // Add totals row
  const totals = data.chartData.reduce(
    (acc, item) => ({
      revenue: acc.revenue + item.revenue,
      orders: acc.orders + item.orders,
      cancelled: acc.cancelled + item.cancelled,
    }),
    { revenue: 0, orders: 0, cancelled: 0 },
  );

  detailedData.push([
    "TỔNG CỘNG",
    totals.revenue,
    totals.orders,
    totals.cancelled,
    totals.orders > 0
      ? ((totals.cancelled / totals.orders) * 100).toFixed(2)
      : "0",
  ]);

  const detailedSheet = XLSX.utils.aoa_to_sheet([headers, ...detailedData]);

  // Set column widths
  detailedSheet["!cols"] = [
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(workbook, detailedSheet, "Chi tiết");

  // Generate filename
  const fileName = `bao-cao-doanh-thu-${data.period}-${new Date().toISOString().split("T")[0]}.xlsx`;

  // Write file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, fileName);

  return fileName;
}

function getPeriodLabel(period: Period): string {
  const labels: Record<Period, string> = {
    daily: "Theo ngày",
    monthly: "Theo tháng",
    yearly: "Theo năm",
  };
  return labels[period] || period;
}

function getTimeColumnHeader(period: string): string {
  const headers: Record<string, string> = {
    daily: "Ngày",
    monthly: "Tháng",
    yearly: "Năm",
  };
  return headers[period] || "Thời gian";
}

/**
 * Export generic data to Excel
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  headers: { key: keyof T; label: string }[],
  fileName: string,
): void {
  const headerRow = headers.map((h) => h.label);
  const rows = data.map((item) => headers.map((h) => item[h.key]));

  const sheet = XLSX.utils.aoa_to_sheet([headerRow, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Data");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, fileName);
}
