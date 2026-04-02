import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

interface StatRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
}

export const StatRow = React.forwardRef<HTMLDivElement, StatRowProps>(
  ({ className, label, value, unit, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex justify-between items-center py-2', className)} {...props}>
        <span className="text-sm text-text-secondary">{label}</span>
        <span className="text-sm font-medium text-text-primary">
          {value} {unit && <span className="text-text-muted">{unit}</span>}
        </span>
      </div>
    );
  }
);
StatRow.displayName = 'StatRow';