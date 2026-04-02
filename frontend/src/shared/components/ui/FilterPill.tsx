import * as React from 'react';
import { cn } from '@/shared/utils/classnames';
import { X } from 'lucide-react';

interface FilterPillProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  onRemove?: () => void;
}

export const FilterPill = React.forwardRef<HTMLDivElement, FilterPillProps>(
  ({ className, label, onRemove, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 bg-surface-subtle text-text-secondary rounded-full px-3 py-1 text-sm',
          className
        )}
        {...props}
      >
        <span>{label}</span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="ml-1 hover:text-text-primary"
            aria-label="Remove filter"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }
);
FilterPill.displayName = 'FilterPill';