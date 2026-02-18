"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { apiClient, fetcher } from "@/lib/api-client";
import {
  AuthUser,
  LoginInput,
  RegisterInput,
  LoginResponse,
} from "@/types/user";

export function useAuth() {
  const router = useRouter();
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<AuthUser>("/auth/me", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const login = async (data: LoginInput) => {
    const result = await apiClient.post<LoginResponse>("/auth/login", data);
    await mutate(result.user);
    return result;
  };

  const register = async (data: RegisterInput) => {
    const result = await apiClient.post<LoginResponse>("/auth/register", data);
    await mutate(result.user);
    return result;
  };

  const logout = async () => {
    await apiClient.post("/auth/logout");
    await mutate(undefined);
    router.push("/admin/login");
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    isAdmin: user?.role === "ADMIN",
    login,
    register,
    logout,
    mutate,
  };
}
