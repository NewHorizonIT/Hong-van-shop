"use client";

import useSWR, { SWRConfiguration } from "swr";
import { useSWRConfig } from "swr";
import { apiClient, fetcher, ApiError } from "@/lib/api-client";
import { Order, CreateOrderInput, UpdateOrderInput } from "@/types/order";
import { OrderStatus } from "@/types/api";

interface OrdersParams {
  status?: OrderStatus;
  from?: string;
  to?: string;
}

// Response type from API (paginated)
interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UpcomingOrdersResponse {
  orders: Order[];
  count: number;
}

function buildOrdersQuery(params?: OrdersParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", "100"); // Get all orders for now
  if (params?.status) searchParams.set("status", params.status);
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
  dedupingInterval: 5000, // Dedupe requests within 5 seconds
};

export function useOrders(params?: OrdersParams) {
  const query = buildOrdersQuery(params);
  const { data, ...rest } = useSWR<OrderListResponse>(
    `/orders${query}`,
    fetcher,
    noAuthRetryConfig,
  );

  return {
    data: data?.orders,
    ...rest,
  };
}

export function useOrder(id: string | null) {
  return useSWR<Order>(id ? `/orders/${id}` : null, fetcher, noAuthRetryConfig);
}

export function useUpcomingOrders(hours: number = 2) {
  const { data, ...rest } = useSWR<UpcomingOrdersResponse>(
    `/orders/upcoming?hours=${hours}`,
    fetcher,
    {
      ...noAuthRetryConfig,
      refreshInterval: 60000, // Refresh every minute
    },
  );

  return {
    data: data?.orders,
    ...rest,
  };
}

export function useCreateOrder() {
  const { mutate } = useSWRConfig();

  return async (data: CreateOrderInput) => {
    const result = await apiClient.post<Order>("/orders", data);
    // Revalidate all order-related keys
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/orders"),
    );
    return result;
  };
}

export function useUpdateOrder() {
  const { mutate } = useSWRConfig();

  return async (id: string, data: UpdateOrderInput) => {
    const result = await apiClient.patch<Order>(`/orders/${id}`, data);
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/orders"),
    );
    return result;
  };
}

export function useDeleteOrder() {
  const { mutate } = useSWRConfig();

  return async (id: string) => {
    await apiClient.delete(`/orders/${id}`);
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/orders"),
    );
  };
}

export function useUpdateOrderStatus() {
  const { mutate } = useSWRConfig();

  return async (id: string, status: OrderStatus) => {
    const result = await apiClient.patch<Order>(`/orders/${id}`, { status });
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/orders"),
    );
    return result;
  };
}
