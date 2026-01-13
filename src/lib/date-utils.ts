import { format } from "date-fns";
import { enUS } from "date-fns/locale";

/**
 * Format date for display in forms and components.
 * Uses consistent PPP format (e.g., "December 1, 2023")
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "PPP", { locale: enUS });
};

/**
 * Format date for display in lists and cards.
 * Uses dd MMMM yyyy format (e.g., "01 December 2023")
 */
export const formatDateList = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "dd MMMM yyyy", { locale: enUS });
};

/**
 * Format date for display in compact form.
 * Uses MMM d, yyyy format (e.g., "Dec 1, 2023")
 */
export const formatDateCompact = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM d, yyyy", { locale: enUS });
};

/**
 * Common date picker constraints
 */
export const datePickerConstraints = {
  /** Disable dates in the future */
  maxDate: new Date(),
  /** Disable dates before 1900 */
  minDate: new Date("1900-01-01"),
  /** Date picker disabled function for react-hook-form */
  disabled: (date: Date) => date > new Date() || date < new Date("1900-01-01"),
};
