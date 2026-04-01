import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  description?: string;
}

const variantStyles = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  danger: 'alert-danger',
};

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertCircle,
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, description, children, ...props }, ref) => {
    const Icon = icons[variant];
    return (
      <div
        ref={ref}
        className={cn('alert', variantStyles[variant], className)}
        role="alert"
        {...props}
      >
        <div className="flex gap-3">
          <Icon className="h-5 w-5 shrink-0" />
          <div>
            {title && <div className="font-semibold">{title}</div>}
            {description && <div className="mt-1 text-sm">{description}</div>}
            {children}
          </div>
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

