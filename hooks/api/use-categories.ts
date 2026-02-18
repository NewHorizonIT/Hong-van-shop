"use client";

import useSWR, { SWRConfiguration, useSWRConfig } from "swr";
import { apiClient, fetcher, ApiError } from "@/lib/api-client";
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/types/category";

// Response type from API (paginated)
interface CategoryListResponse {
  categories: Category[];
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

export function useCategories() {
  const { data, ...rest } = useSWR<CategoryListResponse>(
    "/categories?limit=100",
    fetcher,
    noAuthRetryConfig,
  );

  return {
    data: data?.categories,
    ...rest,
  };
}

export function useCategory(id: string | null) {
  return useSWR<Category>(
    id ? `/categories/${id}` : null,
    fetcher,
    noAuthRetryConfig,
  );
}

export function useCreateCategory() {
  const { mutate } = useSWRConfig();

  return async (data: CreateCategoryInput) => {
    const result = await apiClient.post<Category>("/categories", data);
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/categories"),
    );
    return result;
  };
}

export function useUpdateCategory() {
  const { mutate } = useSWRConfig();

  return async (id: string, data: UpdateCategoryInput) => {
    const result = await apiClient.patch<Category>(`/categories/${id}`, data);
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/categories"),
    );
    return result;
  };
}

export function useDeleteCategory() {
  const { mutate } = useSWRConfig();

  return async (id: string) => {
    await apiClient.delete(`/categories/${id}`);
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/categories"),
    );
  };
}
