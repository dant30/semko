// frontend/src/shared/components/tables/TableHint.tsx
import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

interface TableHintProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof JSX.IntrinsicElements;
}

export const TableHint = React.forwardRef<HTMLElement, TableHintProps>(
  ({ className, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn('mt-2 text-sm text-text-muted', className)}
        {...props}
      />
    );
  }
);
TableHint.displayName = 'TableHint';