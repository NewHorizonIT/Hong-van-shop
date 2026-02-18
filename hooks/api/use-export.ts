"use client";

import { apiClient } from "@/lib/api-client";

interface ExportParams {
  from: string;
  to: string;
}

function buildQuery(params: ExportParams): string {
  return `?from=${params.from}&to=${params.to}`;
}

export function useExport() {
  return {
    exportOrders: async (params: ExportParams) => {
      const filename = `orders_${params.from.split("T")[0]}_${params.to.split("T")[0]}.xlsx`;
      await apiClient.download(`/export/orders${buildQuery(params)}`, filename);
    },

    exportRevenue: async (params: ExportParams) => {
      const filename = `revenue_${params.from.split("T")[0]}_${params.to.split("T")[0]}.xlsx`;
      await apiClient.download(
        `/export/revenue${buildQuery(params)}`,
        filename,
      );
    },

    exportCustomers: async () => {
      const filename = `customers_${new Date().toISOString().split("T")[0]}.xlsx`;
      await apiClient.download("/export/customers", filename);
    },

    exportProducts: async () => {
      const filename = `products_${new Date().toISOString().split("T")[0]}.xlsx`;
      await apiClient.download("/export/products", filename);
    },

    exportInventoryImports: async (params: ExportParams) => {
      const filename = `inventory_${params.from.split("T")[0]}_${params.to.split("T")[0]}.xlsx`;
      await apiClient.download(
        `/export/inventory-imports${buildQuery(params)}`,
        filename,
      );
    },
  };
}
