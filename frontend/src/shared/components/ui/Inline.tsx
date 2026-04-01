import * as React from 'react';
import { cn } from '@/lib/utils';

interface InlineProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end';
}

const spacingMap = {
  xs: 'space-x-1',
  sm: 'space-x-2',
  md: 'space-x-4',
  lg: 'space-x-6',
  xl: 'space-x-8',
};

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
};

export const Inline = React.forwardRef<HTMLDivElement, InlineProps>(
  ({ className, spacing = 'md', align = 'center', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-row flex-wrap', spacingMap[spacing], alignMap[align], className)}
        {...props}
      />
    );
  }
);
Inline.displayName = 'Inline';