import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a poster path to a full image URL with fallback
 * @param posterPath - The relative poster image path or null
 * @param placeholder - The fallback image URL
 * @returns The full image URL or placeholder path
 */
export const getPosterUrl = (
  posterPath: string | null,
  placeholder = "/placeholder-movie.jpg"
): string => posterPath ?? placeholder
