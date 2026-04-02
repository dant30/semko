import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'panel' | 'subtle';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const variantMap = {
  default: 'bg-surface-bg border-surface-border',
  panel: 'bg-surface-panel border-surface-border',
  subtle: 'bg-surface-subtle border-surface-border',
};

const roundedMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
};

const paddingMap = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant = 'default', rounded = 'md', padding = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'border',
          variantMap[variant],
          roundedMap[rounded],
          paddingMap[padding],
          className
        )}
        {...props}
      />
    );
  }
);
Surface.displayName = 'Surface';