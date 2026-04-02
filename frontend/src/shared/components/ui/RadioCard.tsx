import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

interface RadioCardProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export const RadioCard = React.forwardRef<HTMLInputElement, RadioCardProps>(
  ({ className, label, description, ...props }, ref) => {
    const id = React.useId();
    return (
      <div>
        <input type="radio" id={id} ref={ref} className="sr-only peer" {...props} />
        <label
          htmlFor={id}
          className={cn(
            'block p-4 border rounded-xl cursor-pointer transition-all peer-checked:border-brand-500 peer-checked:bg-brand-50 dark:peer-checked:bg-brand-900/20',
            className
          )}
        >
          <span className="font-medium text-text-primary">{label}</span>
          {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
        </label>
      </div>
    );
  }
);
RadioCard.displayName = 'RadioCard';