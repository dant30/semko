import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('card-header', className)} {...props} />
));

CardHeader.displayName = 'CardHeader';