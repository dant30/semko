/**
 * Notifications UI module - provides toast notification utilities for tests and components
 */

export interface ToastOptions {
  title?: string;
  message: string;
  tone?: 'success' | 'info' | 'warning' | 'danger';
  duration?: number;
}

/**
 * Toast notification function - used primarily for testing
 * In actual components, use the useNotifications hook from NotificationProvider instead
 */
export function toast(options: ToastOptions): void {
  // This is a stub for testing. Real implementations use the NotificationProvider context.
  console.debug('Toast notification:', options);
}

export default { toast };
