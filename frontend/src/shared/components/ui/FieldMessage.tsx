import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

export const FieldMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={cn('form-error', className)} {...props} />;
  }
);
FieldMessage.displayName = 'FieldMessage';