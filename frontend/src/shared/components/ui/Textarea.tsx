import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn('form-textarea', error && 'border-danger focus:ring-danger/20', className)}
          ref={ref}
          {...props}
        />
        {error && <p className="form-error mt-1">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
