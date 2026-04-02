import * as React from 'react';
import { cn } from '@/shared/utils/classnames';
import { Avatar } from './Avatar';

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max = 3, ...props }, ref) => {
    const avatars = React.Children.toArray(children).filter(
      (child) => React.isValidElement(child) && child.type === Avatar
    );
    const visibleAvatars = avatars.slice(0, max);
    const remaining = avatars.length - max;

    return (
      <div ref={ref} className={cn('flex -space-x-2', className)} {...props}>
        {visibleAvatars}
        {remaining > 0 && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-subtle text-sm font-medium text-text-secondary ring-2 ring-white dark:ring-slate-900">
            +{remaining}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = 'AvatarGroup';