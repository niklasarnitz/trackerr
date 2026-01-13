import { TRPCError } from "@trpc/server";
import { z } from "zod";

/**
 * Generic API Client for making fetch requests with validation
 * Handles error handling and Zod schema validation
 */
export class APIClient {
  /**
   * Make a fetch request with automatic Zod schema validation
   * @param url - URL to fetch from
   * @param schema - Zod schema to validate response
   * @param options - Optional fetch options
   * @returns Validated and parsed response
   */
  async fetch<T>(
    url: string | URL,
    schema: z.ZodSchema<T>,
    options?: RequestInit,
  ): Promise<T> {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorCode =
        response.status === 404
          ? ("NOT_FOUND" as const)
          : ("INTERNAL_SERVER_ERROR" as const);
      throw new TRPCError({
        code: errorCode,
        message: `API request failed: ${response.statusText}`,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json();

    try {
      return schema.parse(data);
    } catch (error) {
      console.error("API response validation failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Invalid response from API",
      });
    }
  }

  /**
   * Build a URL with search parameters
   * @param baseUrl - Base URL to build from
   * @param params - Search parameters to add
   * @returns Constructed URL
   */
  buildUrl(
    baseUrl: string,
    params?: Record<string, string | number | boolean>,
  ): URL {
    const url = new URL(baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }
    return url;
  }
}

export const apiClient = new APIClient();
