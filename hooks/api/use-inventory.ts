"use client";

import useSWR, { SWRConfiguration } from "swr";
import { useSWRConfig } from "swr";
import { apiClient, fetcher, ApiError } from "@/lib/api-client";
import {
  InventoryImport,
  InventoryImportListResponse,
  CreateInventoryImportInput,
  UpdateInventoryImportInput,
} from "@/types/inventory";

interface InventoryImportsParams {
  ingredientId?: string;
  from?: string;
  to?: string;
  limit?: number;
}

function buildQuery(params?: InventoryImportsParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(params?.limit || 100));
  if (params?.ingredientId)
    searchParams.set("ingredientId", params.ingredientId);
  if (params?.from) searchParams.set("from", params.from);
  if (params?.to) searchParams.set("to", params.to);
  return `?${searchParams.toString()}`;
}

// Common SWR config - don't retry on auth errors
const noAuthRetryConfig: SWRConfiguration = {
  onErrorRetry: (error, _key, _config, _revalidate, { retryCount }) => {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      return;
    }
    if (error?.status === 401 || error?.status === 403) {
      return;
    }
    if (retryCount >= 2) return;
  },
  revalidateOnFocus: false,
  dedupingInterval: 5000,
};

export function useInventoryImports(params?: InventoryImportsParams) {
  const query = buildQuery(params);
  const { data, ...rest } = useSWR<InventoryImportListResponse>(
    `/inventory-imports${query}`,
    fetcher,
    noAuthRetryConfig,
  );

  return {
    data: data?.imports,
    total: data?.total,
    ...rest,
  };
}

export function useInventoryImport(id: string | null) {
  return useSWR<InventoryImport>(
    id ? `/inventory-imports/${id}` : null,
    fetcher,
    noAuthRetryConfig,
  );
}

export function useCreateInventoryImport() {
  const { mutate } = useSWRConfig();

  return async (data: CreateInventoryImportInput) => {
    const result = await apiClient.post<InventoryImport>(
      "/inventory-imports",
      data
    );
    // Revalidate inventory and ingredient data
    mutate(
      (key: string) =>
        typeof key === "string" &&
        (key.startsWith("/inventory-imports") || key.startsWith("/ingredients"))
    );
    return result;
  };
}

export function useUpdateInventoryImport() {
  const { mutate } = useSWRConfig();

  return async (id: string, data: UpdateInventoryImportInput) => {
    const result = await apiClient.patch<InventoryImport>(
      `/inventory-imports/${id}`,
      data
    );
    mutate(
      (key: string) =>
        typeof key === "string" &&
        (key.startsWith("/inventory-imports") || key.startsWith("/ingredients"))
    );
    return result;
  };
}

export function useDeleteInventoryImport() {
  const { mutate } = useSWRConfig();

  return async (id: string) => {
    await apiClient.delete(`/inventory-imports/${id}`);
    mutate(
      (key: string) =>
        typeof key === "string" &&
        (key.startsWith("/inventory-imports") || key.startsWith("/ingredients"))
    );
  };
}

// Get summary statistics for inventory imports
export function useInventoryImportStats(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  params.set("limit", "1000"); // Get all for stats

  const { data, ...rest } = useSWR<InventoryImportListResponse>(
    `/inventory-imports?${params.toString()}`,
    fetcher,
    noAuthRetryConfig
  );

  // Calculate stats from imports
  const stats = {
    totalImports: data?.total || 0,
    totalQuantity: 0,
    totalCost: 0,
  };

  if (data?.imports) {
    data.imports.forEach((imp) => {
      stats.totalQuantity += Number(imp.quantity);
      stats.totalCost += Number(imp.totalPrice);
    });
  }

  return {
    data: stats,
    imports: data?.imports,
    ...rest,
  };
}
