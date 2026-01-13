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
 * Get display label for sound system type
 */
export const getSoundSystemLabel = (value: string): string => {
  return (
    SOUND_SYSTEM_TYPES[
      value as keyof typeof SOUND_SYSTEM_TYPES
    ] ?? value.replace(/_/g, " ")
  );
};

/**
 * Get display label for projection type
 */
export const getProjectionTypeLabel = (value: string): string => {
  return (
    PROJECTION_TYPES[value as keyof typeof PROJECTION_TYPES] ??
    value.replace(/_/g, " ")
  );
};

/**
 * Get display label for language type
 */
export const getLanguageTypeLabel = (value: string): string => {
  return (
    LANGUAGE_TYPES[value as keyof typeof LANGUAGE_TYPES] ??
    value.replace(/_/g, " ")
  );
};

/**
 * Get display label for aspect ratio
 */
export const getAspectRatioLabel = (value: string): string => {
  return (
    ASPECT_RATIOS[value as keyof typeof ASPECT_RATIOS] ??
    value.replace(/_/g, " ")
  );
};

/**
 * Get display label for watch location
 */
export const getWatchLocationLabel = (value: string): string => {
  return (
    WATCH_LOCATIONS[value as keyof typeof WATCH_LOCATIONS] ??
    value.replace(/_/g, " ")
  );
};

/**
 * Get display label for media type
 */
export const getMediaTypeLabel = (value: string): string => {
  return (
    MEDIA_TYPES[value as keyof typeof MEDIA_TYPES] ?? value.replace(/_/g, " ")
  );
};

/**
 * Get display label for streaming service
 */
export const getStreamingServiceLabel = (value: string): string => {
  return (
    STREAMING_SERVICES[value as keyof typeof STREAMING_SERVICES] ??
    value.replace(/_/g, " ")
  );
};
