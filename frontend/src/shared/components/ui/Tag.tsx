import * as React from 'react';
import { cn } from '@/lib/utils';

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const variantMap = {
  primary: 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300',
  secondary: 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300',
  success: 'bg-success/10 text-success-800 dark:bg-success/10 dark:text-success-300',
  warning: 'bg-warning/10 text-warning-800 dark:bg-warning/10 dark:text-warning-300',
  danger: 'bg-danger/10 text-danger-800 dark:bg-danger/10 dark:text-danger-300',
};

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variantMap[variant], className)}
        {...props}
      />
    );
  }
);
Tag.displayName = 'Tag';