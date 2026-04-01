import * as React from 'react';
import { Input } from './Input';
import { Eye, EyeOff } from 'lucide-react';
import { IconButton } from './IconButton';

export const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          {...props}
          className="pr-10"
        />
        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={() => setShowPassword(!showPassword)}
          icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        />
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';