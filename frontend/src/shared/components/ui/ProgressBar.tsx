import { forwardRef } from "react";

import { classNames } from "@/shared/utils/classnames";

export interface ProgressBarProps {
  value: number;
  className?: string;
  variant?: "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

const variantClasses = {
  primary: "bg-gradient-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
};

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      className,
      variant = "primary",
      size = "md",
      showLabel = false,
      animated = true,
      ...props
    },
    ref
  ) => {
    const clampedValue = Math.max(0, Math.min(value, 100));

    return (
      <div className="space-y-1">
        <div
          ref={ref}
          className={classNames(
            "w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <div
            className={classNames(
              "h-full rounded-full transition-all duration-300",
              variantClasses[variant],
              animated && "transition-all duration-500 ease-out",
              `w-[${clampedValue}%]`
            )}
          />
        </div>
        {showLabel && (
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Progress</span>
            <span>{clampedValue}%</span>
          </div>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

