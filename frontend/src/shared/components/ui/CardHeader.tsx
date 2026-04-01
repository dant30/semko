import * as React from 'react';
import { cn } from '@/lib/utils';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('card-header', className)} {...props} />;
  }
);
CardHeader.displayName = 'CardHeader';