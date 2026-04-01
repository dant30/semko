import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, title, value, change, icon, ...props }, ref) => {
    const isPositive = change && change > 0;
    const isNegative = change && change < 0;
    return (
      <Card ref={ref} className={cn('p-4', className)} {...props}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-text-muted">{title}</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
            {change !== undefined && (
              <p className={cn('mt-2 text-sm', isPositive && 'text-success', isNegative && 'text-danger')}>
                {isPositive && '↑'} {isNegative && '↓'} {Math.abs(change)}%
              </p>
            )}
          </div>
          {icon && <div className="text-text-muted">{icon}</div>}
        </div>
      </Card>
    );
  }
);
MetricCard.displayName = 'MetricCard';