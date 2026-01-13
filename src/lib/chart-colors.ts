// Chart color utilities for consistent theming across all charts

export const CHART_COLORS = {
  primary: "#18181b", // Dark gray-900
  secondary: "#f4f4f5", // Gray-100
  accent: "#f1f5f9", // Slate-100
  muted: "#f1f5f9", // Slate-100
  success: "#10b981",
  warning: "#f59e0b",
  info: "#3b82f6",
  purple: "#8b5cf6",
  rose: "#f43f5e",
  amber: "#f59e0b",
  emerald: "#10b981",
  cyan: "#06b6d4",
  indigo: "#6366f1",
  pink: "#ec4899",
  lime: "#84cc16",
  orange: "#f97316",
  teal: "#14b8a6",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#eab308",
  slate: "#64748b",
  gray: "#6b7280",
  zinc: "#71717a",
  neutral: "#737373",
  stone: "#78716c",
  // Additional distinct colors for charts
  coral: "#ff7875",
  turquoise: "#36cfc9",
  gold: "#fadb14",
  magenta: "#eb2f96",
  volcano: "#fa541c",
  geekblue: "#2f54eb",
  lime2: "#a0d911",
  purple2: "#722ed1",
} as const;

// Enhanced color palette with good variety for pie charts
export const PIE_CHART_COLORS = [
  CHART_COLORS.info, // Blue
  CHART_COLORS.success, // Green
  CHART_COLORS.warning, // Orange
  CHART_COLORS.purple, // Purple
  CHART_COLORS.rose, // Pink/Red
  CHART_COLORS.cyan, // Cyan
  CHART_COLORS.emerald, // Emerald
  CHART_COLORS.indigo, // Indigo
  CHART_COLORS.pink, // Pink
  CHART_COLORS.lime, // Lime
  CHART_COLORS.orange, // Orange
  CHART_COLORS.teal, // Teal
  CHART_COLORS.violet, // Violet
  CHART_COLORS.green, // Green
  CHART_COLORS.red, // Red
  CHART_COLORS.yellow, // Yellow
  CHART_COLORS.coral, // Coral
  CHART_COLORS.turquoise, // Turquoise
  CHART_COLORS.gold, // Gold
  CHART_COLORS.magenta, // Magenta
  CHART_COLORS.volcano, // Volcano
  CHART_COLORS.geekblue, // Geek Blue
  CHART_COLORS.lime2, // Lime2
  CHART_COLORS.purple2, // Purple2
  CHART_COLORS.slate, // Slate
  CHART_COLORS.gray, // Gray
  CHART_COLORS.zinc, // Zinc
  CHART_COLORS.neutral, // Neutral
  CHART_COLORS.stone, // Stone
] as const;

const predefinedFallbackColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
  "#F1948A",
  "#85C1E9",
  "#D2B4DE",
  "#A9DFBF",
  "#F9E79F",
  "#AED6F1",
  "#FAD7A0",
] as const;

/**
 * Get a chart color for a given index. This function ensures that we never run out of colors
 * by generating additional colors dynamically when needed.
 *
 * @param index - The index of the data point (0-based)
 * @returns A color string (hex, hsl, or color function)
 */
export const getChartColor = (index: number): string => {
  // Use predefined colors first
  if (index < PIE_CHART_COLORS.length) {
    const color = PIE_CHART_COLORS[index];
    if (color) {
      return color;
    }
  }

  // Use fallback colors if within range
  if (index < PIE_CHART_COLORS.length + predefinedFallbackColors.length) {
    const fallbackIndex = index - PIE_CHART_COLORS.length;
    return predefinedFallbackColors[fallbackIndex]!;
  }

  // Generate HSL colors for indices beyond all predefined colors
  const hue = (index * 137.508) % 360; // Golden angle approximation
  const saturation = 65 + (index % 3) * 10; // Vary saturation: 65%, 75%, 85%
  const lightness = 50 + (index % 3) * 10; // Vary lightness: 50%, 60%, 70%

  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
};

/**
 * Get multiple chart colors at once
 *
 * @param count - Number of colors needed
 * @returns Array of color strings
 */
export const getChartColors = (count: number): string[] => {
  return Array.from({ length: count }, (_, index) => getChartColor(index));
};
