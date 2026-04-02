import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('card-footer', className)} {...props} />
));

CardFooter.displayName = 'CardFooter';