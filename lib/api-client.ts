/**
 * API Client for Hong Van Shop
 * Centralized fetch wrapper with error handling
 */

const BASE_URL = "/api";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number = 400) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include", // Include cookies for auth
    ...options,
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success || !res.ok) {
    throw new ApiError(
      json.error?.code || "UNKNOWN_ERROR",
      json.error?.message || "Something went wrong",
      res.status
    );
  }

  return json.data as T;
}

async function requestWithMeta<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data: T; meta?: ApiResponse["meta"] }> {
  const url = `${BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
    ...options,
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success || !res.ok) {
    throw new ApiError(
      json.error?.code || "UNKNOWN_ERROR",
      json.error?.message || "Something went wrong",
      res.status
    );
  }

  return { data: json.data as T, meta: json.meta };
}

async function downloadFile(endpoint: string, filename: string): Promise<void> {
  const url = `${BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new ApiError("DOWNLOAD_ERROR", "Failed to download file", res.status);
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),

  getWithMeta: <T>(endpoint: string) =>
    requestWithMeta<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),

  download: downloadFile,
};

// SWR fetcher
export const fetcher = <T>(url: string) => apiClient.get<T>(url);
