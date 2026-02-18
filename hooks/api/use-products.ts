"use client";

import useSWR, { SWRConfiguration, useSWRConfig } from "swr";
import { apiClient, fetcher, ApiError } from "@/lib/api-client";
import {
  Product,
  ProductVariant,
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
} from "@/types/product";
import { Category } from "@/types/category";

// Response type from API (paginated)
interface ProductListResponse {
  products: Product[];
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

// ============ Products ============

export function useProducts(categoryId?: string) {
  const query = categoryId
    ? `?categoryId=${categoryId}&limit=100`
    : "?limit=100";
  const { data, ...rest } = useSWR<ProductListResponse>(
    `/products${query}`,
    fetcher,
    noAuthRetryConfig,
  );

  return {
    data: data?.products,
    ...rest,
  };
}

export function useProduct(id: string | null) {
  return useSWR<Product & { category: Category; variants: ProductVariant[] }>(
    id ? `/products/${id}` : null,
    fetcher,
    noAuthRetryConfig,
  );
}

export function useCreateProduct() {
  const { mutate } = useSWRConfig();

  return async (data: CreateProductInput) => {
    const result = await apiClient.post<Product>("/products", data);
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/products"),
    );
    return result;
  };
}

export function useUpdateProduct() {
  const { mutate } = useSWRConfig();

  return async (id: string, data: UpdateProductInput) => {
    const result = await apiClient.patch<Product>(`/products/${id}`, data);
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/products"),
    );
    return result;
  };
}

export function useDeleteProduct() {
  const { mutate } = useSWRConfig();

  return async (id: string) => {
    await apiClient.delete(`/products/${id}`);
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/products"),
    );
  };
}

// ============ Product Variants ============

export function useProductVariants(productId: string | null) {
  return useSWR<ProductVariant[]>(
    productId ? `/products/${productId}/variants` : null,
    fetcher,
    noAuthRetryConfig,
  );
}

export function useCreateVariant(productId: string) {
  const { mutate } = useSWRConfig();

  return async (data: CreateVariantInput) => {
    const result = await apiClient.post<ProductVariant>(
      `/products/${productId}/variants`,
      data,
    );
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/products"),
    );
    return result;
  };
}

export function useUpdateVariant(productId: string) {
  const { mutate } = useSWRConfig();

  return async (variantId: string, data: UpdateVariantInput) => {
    const result = await apiClient.patch<ProductVariant>(
      `/products/${productId}/variants/${variantId}`,
      data,
    );
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/products"),
    );
    return result;
  };
}

export function useDeleteVariant(productId: string) {
  const { mutate } = useSWRConfig();

  return async (variantId: string) => {
    await apiClient.delete(`/products/${productId}/variants/${variantId}`);
    mutate(
      (key: string) => typeof key === "string" && key.startsWith("/products"),
    );
  };
}
