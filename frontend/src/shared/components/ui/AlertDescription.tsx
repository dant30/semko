import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

export const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('text-sm', className)} {...props} />;
  }
);
AlertDescription.displayName = 'AlertDescription';