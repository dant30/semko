// frontend/src/shared/utils/dates.ts
/**
 * Format a date string or Date object to a locale-specific date string.
 * @param value - Date string, Date object, or timestamp
 * @param locale - Locale string (default: browser locale)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  value: string | Date | number,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleDateString(locale, options);
}

/**
 * Format a date and time.
 */
export function formatDateTime(
  value: string | Date | number,
  locale?: string
): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleString(locale);
}