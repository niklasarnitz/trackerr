/**
 * Shared chart utilities and formatters for consistent chart styling
 */

/**
 * Standard legend formatter for pie charts and other charts with simple labels
 */
export const standardLegendFormatter = (value: string): string => value;

/**
 * Legend formatter for aspect ratio charts with long labels
 */
export const aspectRatioLegendFormatter = (value: string): string => {
  // Truncate long aspect ratio labels for legend
  const truncated = value.length > 25 ? `${value.substring(0, 25)}...` : value;
  return truncated;
};

/**
 * Standard tooltip styles for consistency across charts
 */
export const standardTooltipStyle = {
  backgroundColor: "hsl(var(--background))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "6px",
};

/**
 * Standard legend styles for consistency across charts
 */
export const standardLegendStyle = {
  verticalAlign: "bottom" as const,
  height: 60,
  wrapperStyle: {
    paddingTop: "10px",
    fontSize: "12px",
    overflow: "hidden",
  },
};

/**
 * Compact legend styles for charts with less space
 */
export const compactLegendStyle = {
  verticalAlign: "bottom" as const,
  height: 36,
  wrapperStyle: {
    paddingTop: "8px",
    fontSize: "11px",
  },
};

/**
 * Standard tooltip formatter for charts
 */
export const standardTooltipFormatter = (value: number, name: string) => [
  value,
  name,
];

/**
 * Generic function to truncate text for legends
 */
export const truncateForLegend = (text: string, maxLength = 25): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};
