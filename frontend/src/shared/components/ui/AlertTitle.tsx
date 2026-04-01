import * as React from 'react';
import { cn } from '@/lib/utils';

export const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return <h5 ref={ref} className={cn('font-semibold', className)} {...props} />;
  }
);
AlertTitle.displayName = 'AlertTitle';