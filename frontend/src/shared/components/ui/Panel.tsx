import * as React from 'react';
import { cn } from '@/shared/utils/classnames';
import { Surface } from './Surface';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'subtle';
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <Surface
        ref={ref}
        variant={variant === 'card' ? 'panel' : variant}
        rounded="lg"
        padding="none"
        className={cn('shadow-soft', className)}
        {...props}
      />
    );
  }
);
Panel.displayName = 'Panel';