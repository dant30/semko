import { forwardRef } from "react";

import { classNames } from "@/shared/utils/classnames";

export interface SpinnerProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "white";
}

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

const variantClasses = {
  primary: "text-brand-600",
  secondary: "text-slate-600 dark:text-slate-400",
  white: "text-white",
};

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", variant = "primary", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames(
          "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = "Spinner";

