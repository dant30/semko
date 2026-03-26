import type { SelectHTMLAttributes } from "react";
import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

import { classNames } from "@/shared/utils/classnames";

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  error?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "px-3 py-2 pr-8 text-sm",
  md: "px-4 py-3 pr-10 text-sm",
  lg: "px-4 py-3.5 pr-10 text-base",
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, size = "md", children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={classNames(
            "form-select ui-focus appearance-none",
            sizeClasses[size],
            error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-600 dark:focus:border-rose-500 dark:focus:ring-rose-900",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
