/**
 * Format number for display with locale-specific formatting.
 * Provides safe fallback for undefined or null values.
 *
 * @param value - The number to format (can be undefined, null, string, or number)
 * @param options - Intl.NumberFormat options
 * @returns Formatted string or "0" if value is invalid
 */
export function formatNumber(
  value: unknown,
  options: Intl.NumberFormatOptions = {
    maximumFractionDigits: 2,
  }
): string {
  // Handle undefined, null, or invalid numeric conversions
  if (value === undefined || value === null) {
    return "0";
  }

  // Convert string to number
  let numValue: number;
  if (typeof value === "string") {
    numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return "0";
    }
  } else if (typeof value === "number") {
    if (!isFinite(value)) {
      return "0";
    }
    numValue = value;
  } else {
    return "0";
  }

  // Format using locale-specific formatting
  try {
    return numValue.toLocaleString(undefined, options);
  } catch {
    // Fallback if toLocaleString fails
    return String(numValue);
  }
}

/**
 * Format large numbers with abbreviated suffixes (K, M, B).
 * Useful for dashboard cards with large metrics.
 *
 * @param value - The number to abbreviate
 * @param decimalPlaces - Number of decimal places (default: 1)
 * @returns Abbreviated string (e.g., "1.5K", "2.3M")
 */
export function formatAbbreviatedNumber(
  value: unknown,
  decimalPlaces: number = 1
): string {
  const numValue = typeof value === "number" ? value : parseFloat(String(value)) || 0;

  if (!isFinite(numValue) || Math.abs(numValue) < 1000) {
    return formatNumber(numValue);
  }

  const abbreviations = [
    { threshold: 1e9, suffix: "B" },
    { threshold: 1e6, suffix: "M" },
    { threshold: 1e3, suffix: "K" },
  ];

  for (const { threshold, suffix } of abbreviations) {
    if (Math.abs(numValue) >= threshold) {
      const abbreviated = numValue / threshold;
      return `${abbreviated.toFixed(decimalPlaces)}${suffix}`;
    }
  }

  return formatNumber(numValue);
}

/**
 * Format currency values with symbol.
 *
 * @param value - The numeric currency value
 * @param currencyCode - ISO currency code (default: "USD")
 * @param locale - Locale string (default: browser locale)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: unknown,
  currencyCode: string = "USD",
  locale?: string
): string {
  const numValue = typeof value === "number" ? value : parseFloat(String(value)) || 0;

  if (!isFinite(numValue)) {
    return "0";
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
    }).format(numValue);
  } catch {
    return formatNumber(numValue);
  }
}

/**
 * Format a value as a percentage.
 *
 * @param value - The numeric value
 * @param decimalPlaces - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: unknown, decimalPlaces: number = 1): string {
  const numValue = typeof value === "number" ? value : parseFloat(String(value)) || 0;

  if (!isFinite(numValue)) {
    return "0%";
  }

  return `${numValue.toFixed(decimalPlaces)}%`;
}
