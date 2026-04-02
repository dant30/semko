// frontend/src/shared/components/ui/Toast.tsx
import * as React from 'react';
import { cn } from '@/shared/utils/classnames';
import { X } from 'lucide-react';

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  onClose?: () => void;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'info', title, children, onClose, ...props }, ref) => {
    const variantClasses = {
      info: 'bg-accent-50 border-accent-200 text-accent-900 dark:bg-accent-900/20 dark:border-accent-800',
      success: 'bg-success/10 border-success/20 text-success-800 dark:bg-success/10 dark:border-success/30',
      warning: 'bg-warning/10 border-warning/20 text-warning-800 dark:bg-warning/10 dark:border-warning/30',
      danger: 'bg-danger/10 border-danger/20 text-danger-800 dark:bg-danger/10 dark:border-danger/30',
    };
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-lg border p-4 shadow-hard animate-slide-up',
          variantClasses[variant],
          className
        )}
        role="alert"
        {...props}
      >
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div>{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-text-muted hover:text-text-primary"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }
);
Toast.displayName = 'Toast';
