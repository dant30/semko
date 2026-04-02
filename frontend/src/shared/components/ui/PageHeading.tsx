import * as React from 'react';
import { cn } from '@/shared/utils/classnames';
import { Heading } from './Heading';

interface PageHeadingProps extends React.ComponentPropsWithoutRef<typeof Heading> {}

export const PageHeading = React.forwardRef<HTMLHeadingElement, PageHeadingProps>(
  ({ className, ...props }, ref) => {
    return <Heading ref={ref} level={1} weight="bold" className={cn('mb-4', className)} {...props} />;
  }
);
PageHeading.displayName = 'PageHeading';