import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

import { classNames } from "@/shared/utils/classnames";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-sm",
  lg: "px-4 py-3.5 text-base",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, size = "md", ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <span className="text-slate-400">{leftIcon}</span>
          </div>
        )}
        <input
          ref={ref}
          className={classNames(
            "form-input ui-focus",
            sizeClasses[size],
            leftIcon && "pl-11",
            rightIcon && "pr-11",
            error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-600 dark:focus:border-rose-500 dark:focus:ring-rose-900",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <span className="text-slate-400">{rightIcon}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
