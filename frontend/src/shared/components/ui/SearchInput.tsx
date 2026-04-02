import * as React from 'react';
import { cn } from '@/shared/utils/classnames';
import { Input } from './Input';
import { Search } from 'lucide-react';

export const SearchInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <Input ref={ref} className={cn('pl-10', className)} {...props} />
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';