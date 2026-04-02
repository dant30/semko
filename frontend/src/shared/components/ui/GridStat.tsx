import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

interface GridStatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export const GridStat = React.forwardRef<HTMLDivElement, GridStatProps>(
  ({ className, label, value, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between rounded-lg border border-surface-border p-4', className)}
        {...props}
      >
        <div>
          <p className="text-sm text-text-muted">{label}</p>
          <p className="mt-1 text-xl font-semibold text-text-primary">{value}</p>
        </div>
        {icon && <div className="text-text-muted">{icon}</div>}
      </div>
    );
  }
);
GridStat.displayName = 'GridStat';