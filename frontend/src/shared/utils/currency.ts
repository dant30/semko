// frontend/src/shared/utils/currency.ts
import { formatNumber } from './number';

/**
 * Format currency in Kenyan Shillings (KES).
 * @param value - Amount as number or string
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted currency string (e.g., "KSh 1,234.56")
 */
export function formatKES(
  value: unknown,
  options?: Intl.NumberFormatOptions
): string {
  const num = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  if (!isFinite(num)) return 'KSh 0';

  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      ...options,
    }).format(num);
  } catch {
    return `KSh ${formatNumber(num)}`;
  }
}

// Alias for convenience
export const formatCurrency = formatKES;