import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  onRemove?: () => void;
  variant?: 'default' | 'outline';
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, label, onRemove, variant = 'default', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm';
    const variantClasses = {
      default: 'bg-surface-subtle text-text-secondary',
      outline: 'border border-surface-border text-text-secondary',
    };
    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      >
        <span>{label}</span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="ml-1 hover:text-text-primary"
            aria-label="Remove"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }
);
Chip.displayName = 'Chip';