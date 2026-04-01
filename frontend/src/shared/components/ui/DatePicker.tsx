import * as React from 'react';
import { Input } from './Input';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DatePicker = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <Input ref={ref} type="date" className={cn('pl-10', className)} {...props} />
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';
