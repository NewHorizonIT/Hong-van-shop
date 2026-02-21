"use client";

import useSWR, { SWRConfiguration, useSWRConfig } from "swr";
import { apiClient, fetcher, ApiError } from "@/lib/api-client";
import {
  Ingredient,
  IngredientListResponse,
  CreateIngredientInput,
  UpdateIngredientInput,
} from "@/types/ingredient";

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

export function useIngredients(search?: string) {
  const params = new URLSearchParams();
  params.set("limit", "100");
  if (search) params.set("search", search);

  const { data, ...rest } = useSWR<IngredientListResponse>(
    `/ingredients?${params.toString()}`,
    fetcher,
    noAuthRetryConfig
  );

  return {
    data: data?.ingredients,
    total: data?.total,
    ...rest,
  };
}

export function useActiveIngredients() {
  const { data, ...rest } = useSWR<IngredientListResponse>(
    "/ingredients?limit=100&isActive=true",
    fetcher,
    noAuthRetryConfig
  );

  return {
    data: data?.ingredients,
    ...rest,
  };
}

export function useIngredient(id: string | null) {
  return useSWR<Ingredient>(
    id ? `/ingredients/${id}` : null,
    fetcher,
    noAuthRetryConfig
  );
}

export function useCreateIngredient() {
  const { mutate } = useSWRConfig();

  return async (data: CreateIngredientInput) => {
    const result = await apiClient.post<Ingredient>("/ingredients", data);
    mutate(
      (key: string) =>
        typeof key === "string" && key.startsWith("/ingredients")
    );
    return result;
  };
}

export function useUpdateIngredient() {
  const { mutate } = useSWRConfig();

  return async (id: string, data: UpdateIngredientInput) => {
    const result = await apiClient.patch<Ingredient>(`/ingredients/${id}`, data);
    mutate(
      (key: string) =>
        typeof key === "string" && key.startsWith("/ingredients")
    );
    return result;
  };
}

export function useDeleteIngredient() {
  const { mutate } = useSWRConfig();

  return async (id: string) => {
    await apiClient.delete(`/ingredients/${id}`);
    mutate(
      (key: string) =>
        typeof key === "string" && key.startsWith("/ingredients")
    );
  };
}
