import * as React from 'react';
import { cn } from '@/shared/utils/classnames';
import { Heading } from './Heading';

interface SectionHeadingProps extends React.ComponentPropsWithoutRef<typeof Heading> {}

export const SectionHeading = React.forwardRef<HTMLHeadingElement, SectionHeadingProps>(
  ({ className, ...props }, ref) => {
    return <Heading ref={ref} level={2} weight="semibold" className={cn('mb-3', className)} {...props} />;
  }
);
SectionHeading.displayName = 'SectionHeading';