import { NextResponse } from "next/server";

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

export function apiSuccess<T>(
  data: T,
  status: number = 200,
  meta?: ApiResponse["meta"],
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status },
  );
}

export function apiError(
  code: string,
  message: string,
  status: number = 400,
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status },
  );
}

// Common error responses
export const ApiErrors = {
  UNAUTHORIZED: () => apiError("UNAUTHORIZED", "Unauthorized", 401),
  FORBIDDEN: () => apiError("FORBIDDEN", "Forbidden", 403),
  NOT_FOUND: (resource: string = "Resource") =>
    apiError("NOT_FOUND", `${resource} not found`, 404),
  VALIDATION_ERROR: (message: string) =>
    apiError("VALIDATION_ERROR", message, 400),
  INTERNAL_ERROR: () =>
    apiError("INTERNAL_ERROR", "Internal server error", 500),
  INVALID_CREDENTIALS: () =>
    apiError("INVALID_CREDENTIALS", "Invalid email or password", 401),
  USER_INACTIVE: () =>
    apiError("USER_INACTIVE", "User account is inactive", 403),
};
