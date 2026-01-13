/**
 * Centralized API Configuration
 * Contains all API endpoints, URLs, and configuration constants
 */

export const API_CONFIG = {
  TMDB: {
    baseUrl: "https://api.themoviedb.org/3",
    imageBaseUrl: "https://image.tmdb.org/t/p/w500",
    genresCacheTtlMs: 1000 * 60 * 60 * 24, // 24 hours
  },
  GOOGLE_BOOKS: {
    baseUrl: "https://www.googleapis.com/books/v1/volumes",
    maxResults: 20,
  },
  OPEN_LIBRARY: {
    baseUrl: "https://openlibrary.org",
  },
  AMAZON: {
    // Configuration for Amazon scraper if needed
  },
  HUGENDUBEL: {
    // Configuration for Hugendubel API if needed
  },
} as const;

export type APIConfigType = typeof API_CONFIG;
