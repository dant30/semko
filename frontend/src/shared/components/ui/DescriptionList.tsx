import * as React from 'react';
import { cn } from '@/lib/utils';

interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  items: Array<{ label: string; value: React.ReactNode }>;
  orientation?: 'horizontal' | 'vertical';
}

export const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(
  ({ className, items, orientation = 'horizontal', ...props }, ref) => {
    return (
      <dl
        ref={ref}
        className={cn(
          orientation === 'horizontal' ? 'grid grid-cols-2 gap-2' : 'space-y-2',
          className
        )}
        {...props}
      >
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <dt className="text-sm text-text-muted">{item.label}</dt>
            <dd className="text-sm font-medium text-text-primary">{item.value}</dd>
          </React.Fragment>
        ))}
      </dl>
    );
  }
);
DescriptionList.displayName = 'DescriptionList';