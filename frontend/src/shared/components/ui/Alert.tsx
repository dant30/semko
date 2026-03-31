// frontend/src/shared/components/ui/Alert.tsx
import type { PropsWithChildren } from "react";
import { forwardRef } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";

import { classNames } from "@/shared/utils/classnames";
import { Button } from "./Button";

type AlertVariant = "info" | "success" | "warning" | "danger";

const variantClasses: Record<AlertVariant, string> = {
  info: "alert-info",
  success: "alert-success",
  warning: "alert-warning",
  danger: "alert-danger",
};

const variantIcons: Record<AlertVariant, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  danger: XCircle,
};

export interface AlertProps {
  children: React.ReactNode;
  className?: string;
  variant?: AlertVariant;
  title?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  dismissible?: boolean;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      children,
      className,
      variant = "info",
      title,
      icon,
      onClose,
      dismissible = false,
      ...props
    },
    ref
  ) => {
    const Icon = variantIcons[variant];

    return (
      <div
        ref={ref}
        className={classNames("alert", variantClasses[variant], className)}
        role="alert"
        {...props}
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {icon || <Icon className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            {title && (
              <h4 className="font-semibold text-sm mb-1">
                {title}
              </h4>
            )}
            <div className="text-sm">
              {children}
            </div>
          </div>
          {dismissible && (
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 hover:bg-transparent"
                aria-label="Dismiss alert"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";

