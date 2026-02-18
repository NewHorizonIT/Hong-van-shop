"use client";

import useSWR, { SWRConfiguration, useSWRConfig } from "swr";
import { apiClient, fetcher, ApiError } from "@/lib/api-client";
import {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/types/customer";

// Response type from API (paginated)
interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

export function useCustomers() {
  const { data, ...rest } = useSWR<CustomerListResponse>(
    "/customers?limit=100",
    fetcher,
    noAuthRetryConfig,
  );

  return {
    data: data?.customers,
    ...rest,
  };
}

export function useCustomer(id: string | null) {
  return useSWR<Customer>(
    id ? `/customers/${id}` : null,
    fetcher,
    noAuthRetryConfig,
  );
}

export function useCreateCustomer() {
  const { mutate } = useSWRConfig();

  return async (data: CreateCustomerInput) => {
    const result = await apiClient.post<Customer>("/customers", data);
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/customers"),
    );
    return result;
  };
}

export function useUpdateCustomer() {
  const { mutate } = useSWRConfig();

  return async (id: string, data: UpdateCustomerInput) => {
    const result = await apiClient.patch<Customer>(`/customers/${id}`, data);
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/customers"),
    );
    return result;
  };
}

export function useDeleteCustomer() {
  const { mutate } = useSWRConfig();

  return async (id: string) => {
    await apiClient.delete(`/customers/${id}`);
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/customers"),
    );
  };
}

// Search customer by phone
export function useSearchCustomerByPhone(phone: string | null) {
  const { data, ...rest } = useSWR<CustomerListResponse>(
    phone && phone.length >= 3 ? `/customers?phone=${phone}&limit=20` : null,
    fetcher,
    noAuthRetryConfig,
  );

  return {
    data: data?.customers,
    ...rest,
  };
}
