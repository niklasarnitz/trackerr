export function normalizeWatchDate(dateLike: Date | string | number) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date provided for normalization");
  }

  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
}

export function normalizeWatchDateOrToday(
  dateLike?: Date | string | number | null,
) {
  return normalizeWatchDate(dateLike ?? new Date());
}

// Convert a stored UTC date to a local calendar date (timezone-agnostic display)
export function toCalendarDate(dateLike: Date | string | number) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

// UTC year range helpers to avoid timezone boundary drift
export function utcStartOfYear(year: number) {
  return new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
}

export function utcEndOfYear(year: number) {
  return new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
}
