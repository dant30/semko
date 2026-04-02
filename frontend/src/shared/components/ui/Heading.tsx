import * as React from 'react';
import { cn } from '@/shared/utils/classnames';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const sizeMap = {
  1: 'text-4xl md:text-5xl',
  2: 'text-3xl md:text-4xl',
  3: 'text-2xl md:text-3xl',
  4: 'text-xl md:text-2xl',
  5: 'text-lg md:text-xl',
  6: 'text-base md:text-lg',
};

const weightMap = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, weight = 'semibold', as, ...props }, ref) => {
    const Component = as || `h${level}`;
    return (
      <Component
        ref={ref}
        className={cn(
          'font-heading tracking-tight text-text-primary',
          sizeMap[level],
          weightMap[weight],
          className
        )}
        {...props}
      />
    );
  }
);
Heading.displayName = 'Heading';