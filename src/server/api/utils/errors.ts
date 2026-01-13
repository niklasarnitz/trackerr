import { TRPCError } from "@trpc/server";

/**
 * Centralized API Error definitions
 * Ensures consistent error messages and codes across the application
 */
export const APIErrors = {
  TMDB: {
    notConfigured: () =>
      new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "TMDB API key not configured",
      }),
    notFound: (context = "Movie") =>
      new TRPCError({
        code: "NOT_FOUND",
        message: `${context} not found on TMDB`,
      }),
    failed: (context = "TMDB") =>
      new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch from ${context}`,
      }),
    invalidResponse: (context = "TMDB") =>
      new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Invalid response from ${context} API`,
      }),
  },
  GOOGLE_BOOKS: {
    failed: () =>
      new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to search Google Books",
      }),
    invalidResponse: () =>
      new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Invalid response from Google Books API",
      }),
  },
  OPEN_LIBRARY: {
    failed: () =>
      new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to search Open Library",
      }),
    invalidResponse: () =>
      new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Invalid response from Open Library API",
      }),
  },
} as const;
