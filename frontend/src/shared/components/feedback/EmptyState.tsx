// frontend/src/shared/components/feedback/EmptyState.tsx
import { forwardRef } from "react";
import { cn } from "@/shared/utils/classnames";

export interface EmptyStateProps {
  /** Main title of the empty state */
  title: string;
  /** Optional descriptive text */
  description?: string;
  /** Optional icon (React node) */
  icon?: React.ReactNode;
  /** Optional action button or link */
  action?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Visual size variant */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "py-8",
  md: "py-12",
  lg: "py-16",
};

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, icon, action, className, size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("empty-state text-center", sizeClasses[size], className)}
        {...props}
      >
        {icon && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-text-secondary">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-text-secondary">{description}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";