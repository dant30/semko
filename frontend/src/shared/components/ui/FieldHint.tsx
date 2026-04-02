import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

export const FieldHint = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={cn('form-help', className)} {...props} />;
  }
);
FieldHint.displayName = 'FieldHint';