import * as React from 'react';
import { cn } from '@/shared/utils/classnames';
import { Menu } from '@headlessui/react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown = ({ trigger, children, align = 'left', className }: DropdownProps) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button as={React.Fragment}>{trigger}</Menu.Button>
      <Menu.Items
        className={cn(
          'dropdown absolute z-10 mt-2 origin-top-right',
          align === 'right' ? 'right-0' : 'left-0',
          className
        )}
      >
        <div className="py-1">{children}</div>
      </Menu.Items>
    </Menu>
  );
};

export const DropdownItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          ref={ref}
          className={cn(
            'dropdown-item',
            active && 'bg-surface-subtle',
            className
          )}
          {...props}
        />
      )}
    </Menu.Item>
  );
});
DropdownItem.displayName = 'DropdownItem';