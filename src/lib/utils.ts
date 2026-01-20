import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple CSS class values using clsx and Tailwind merge
 * @param inputs - CSS class values to combine
 * @returns Combined and optimized CSS class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a poster path to a full image URL with fallback
 * @param posterPath - The relative poster image path or null
 * @param placeholder - The fallback image URL
 * @returns The full image URL or placeholder path
 */
export const getPosterUrl = (
  posterPath: string | null,
  placeholder = "/placeholder-movie.jpg",
): string => {
  if (!posterPath) return placeholder;

  // Absolute URLs are fine
  if (posterPath.startsWith("http://") || posterPath.startsWith("https://")) {
    return posterPath;
  }

  if (posterPath.startsWith("trackerr/imdb-top-250/")) {
    return `https://minio.app.niklas.services/bookworm/${posterPath}`;
  }

  // Ensure relative paths start with a leading slash for Next/Image
  return posterPath.startsWith("/") ? posterPath : `/${posterPath}`;
};
