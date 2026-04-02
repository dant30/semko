import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'brand' | 'accent' | 'success';
}

const variantMap = {
  brand: 'bg-brand-600',
  accent: 'bg-accent-600',
  success: 'bg-success-600',
};

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, variant = 'brand', ...props }, ref) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <div
        ref={ref}
        className={cn('h-2 w-full bg-surface-subtle rounded-full overflow-hidden', className)}
        {...props}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', variantMap[variant])}
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  }
);
ProgressBar.displayName = 'ProgressBar';

