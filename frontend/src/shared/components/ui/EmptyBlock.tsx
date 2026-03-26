import { forwardRef } from "react";

import { classNames } from "@/shared/utils/classnames";

export interface EmptyBlockProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "py-8",
  md: "py-12",
  lg: "py-16",
};

export const EmptyBlock = forwardRef<HTMLDivElement, EmptyBlockProps>(
  ({ title, description, icon, action, className, size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames(
          "empty-state text-center",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    );
  }
);

EmptyBlock.displayName = "EmptyBlock";

