"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";
import { fetcher, ApiError } from "@/lib/api-client";

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        // Don't retry on 401 (unauthorized) or 403 (forbidden)
        onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
          // Never retry on 401 or 403
          if (error instanceof ApiError) {
            if (error.status === 401 || error.status === 403) {
              return;
            }
          }

          // Also check for regular errors with status
          if (error?.status === 401 || error?.status === 403) {
            return;
          }

          // Don't retry on 404
          if (error?.status === 404) {
            return;
          }

          // Only retry up to 3 times
          if (retryCount >= 3) return;

          // Retry after 5 seconds
          setTimeout(() => revalidate({ retryCount }), 5000);
        },
        // Set reasonable revalidation settings
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        shouldRetryOnError: true, // We handle retry logic in onErrorRetry
        dedupingInterval: 2000, // Dedupe requests within 2 seconds
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
}
