import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          ref={ref}
          className={cn('form-checkbox', error && 'border-danger focus:ring-danger/20', className)}
          {...props}
        />
        {label && (
          <label htmlFor={props.id} className="text-sm text-text-secondary">
            {label}
          </label>
        )}
        {error && <p className="form-error mt-1">{error}</p>}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';