import {
  SOUND_SYSTEM_TYPES,
  PROJECTION_TYPES,
  LANGUAGE_TYPES,
  ASPECT_RATIOS,
  WATCH_LOCATIONS,
  MEDIA_TYPES,
} from "~/lib/form-schemas";

/**
 * Get display label for sound system type
 */
export const getSoundSystemLabel = (value: string): string => {
  return (
    SOUND_SYSTEM_TYPES.find((type) => type.value === value)?.label ??
    value.replace(/_/g, " ")
  );
};

/**
 * Get display label for projection type
 */
export const getProjectionTypeLabel = (value: string): string => {
  return (
    PROJECTION_TYPES.find((type) => type.value === value)?.label ??
    value.replace(/_/g, " ")
  );
};

/**
 * Get display label for language type
 */
export const getLanguageTypeLabel = (value: string): string => {
  return (
    LANGUAGE_TYPES.find((type) => type.value === value)?.label ??
    value.replace(/_/g, " ")
  );
};

/**
 * Get display label for aspect ratio
 */
export const getAspectRatioLabel = (value: string): string => {
  return (
    ASPECT_RATIOS.find((ratio) => ratio.value === value)?.label ??
    value.replace(/_/g, " ")
  );
};

/**
 * Get display label for watch location
 */
export const getWatchLocationLabel = (value: string): string => {
  return (
    WATCH_LOCATIONS.find((location) => location.value === value)?.label ??
    value.replace(/_/g, " ")
  );
};

/**
 * Get display label for media type
 */
export const getMediaTypeLabel = (value: string): string => {
  return (
    MEDIA_TYPES.find((type) => type.value === value)?.label ??
    value.replace(/_/g, " ")
  );
};

/**
 * Generic function to get display label from any enum-like array
 */
export const getEnumLabel = <T extends { value: string; label: string }>(
  enumArray: readonly T[],
  value: string,
): string => {
  return (
    enumArray.find((item) => item.value === value)?.label ??
    value.replace(/_/g, " ")
  );
};
