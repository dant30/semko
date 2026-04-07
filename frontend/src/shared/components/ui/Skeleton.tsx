import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

type SkeletonVariant = 'text' | 'circle' | 'rect';

const skeletonVariantClasses: Record<SkeletonVariant, string> = {
  text: 'h-4 rounded',
  circle: 'rounded-full',
  rect: 'rounded-md',
};

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('skeleton animate-pulse bg-surface-subtle', skeletonVariantClasses[variant], className)}
      {...props}
    />
  )
);
Skeleton.displayName = 'Skeleton';

