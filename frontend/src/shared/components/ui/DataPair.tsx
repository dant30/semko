import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

interface DataPairProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
}

export const DataPair = React.forwardRef<HTMLDivElement, DataPairProps>(
  ({ className, label, value, orientation = 'horizontal', ...props }, ref) => {
    const orientationClasses = orientation === 'horizontal' ? 'flex justify-between' : 'space-y-1';
    return (
      <div ref={ref} className={cn(orientationClasses, className)} {...props}>
        <dt className="text-sm text-text-muted">{label}</dt>
        <dd className="text-sm font-medium text-text-primary">{value}</dd>
      </div>
    );
  }
);
DataPair.displayName = 'DataPair';