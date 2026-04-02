import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: Array<{ value: string; label: string }>;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options = [], error, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn('form-select', error && 'border-danger focus:ring-danger/20', className)}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="form-error mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
