import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'form-input',
            error && 'border-danger focus:ring-danger/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="form-error mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
