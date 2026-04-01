import * as React from 'react';
import { cn } from '@/lib/utils';

interface MenuListProps extends React.HTMLAttributes<HTMLUListElement> {
  items: Array<{ label: string; onClick?: () => void; icon?: React.ReactNode }>;
}

export const MenuList = React.forwardRef<HTMLUListElement, MenuListProps>(
  ({ className, items, ...props }, ref) => {
    return (
      <ul ref={ref} className={cn('py-1', className)} {...props}>
        {items.map((item, idx) => (
          <li key={idx}>
            <button
              onClick={item.onClick}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-surface-subtle"
            >
              {item.icon}
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    );
  }
);
MenuList.displayName = 'MenuList';