import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'rect';
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', ...props }, ref) => {
    const variantClasses = {
      text: 'h-4 rounded',
      circle: 'rounded-full',
      rect: 'rounded-md',
    };
    return (
      <div
        ref={ref}
        className={cn('skeleton animate-pulse bg-surface-subtle', variantClasses[variant], className)}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

