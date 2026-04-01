import * as React from 'react';
import { cn } from '@/lib/utils';

export const TableHint = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('mt-2 text-sm text-text-muted', className)} {...props} />;
  }
);
TableHint.displayName = 'TableHint';