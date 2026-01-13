import {
  SOUND_SYSTEM_TYPES,
  PROJECTION_TYPES,
  LANGUAGE_TYPES,
  ASPECT_RATIOS,
  WATCH_LOCATIONS,
  MEDIA_TYPES,
  STREAMING_SERVICES,
} from "~/lib/form-schemas";

/**
 * Create a label getter function for a given map
 * Converts enum values to human-readable labels with fallback to underscore replacement
 * @param map - Object mapping enum values to display labels
 * @returns Function that converts values to display labels
 */
function createLabelGetter<T extends Record<string, string>>(
  map: T,
): (value: string) => string {
  return (value: string): string =>
    map[value as keyof T] ?? value.replace(/_/g, " ");
}

/**
 * Get display label for sound system type
 */
export const getSoundSystemLabel = createLabelGetter(SOUND_SYSTEM_TYPES);

/**
 * Get display label for projection type
 */
export const getProjectionTypeLabel = createLabelGetter(PROJECTION_TYPES);

/**
 * Get display label for language type
 */
export const getLanguageTypeLabel = createLabelGetter(LANGUAGE_TYPES);

/**
 * Get display label for aspect ratio
 */
export const getAspectRatioLabel = createLabelGetter(ASPECT_RATIOS);

/**
 * Get display label for watch location
 */
export const getWatchLocationLabel = createLabelGetter(WATCH_LOCATIONS);

/**
 * Get display label for media type
 */
export const getMediaTypeLabel = createLabelGetter(MEDIA_TYPES);

/**
 * Get display label for streaming service
 */
export const getStreamingServiceLabel = createLabelGetter(STREAMING_SERVICES);
