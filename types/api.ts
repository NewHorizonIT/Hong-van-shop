// Common API types

export type Role = "ADMIN" | "STAFF";
export type OrderStatus = "PENDING" | "CONFIRMED" | "DONE" | "CANCELLED";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DateRangeParams {
  from: string; // ISO date string
  to: string; // ISO date string
}
