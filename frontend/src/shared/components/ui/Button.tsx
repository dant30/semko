import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { forwardRef } from "react";

import { classNames } from "@/shared/utils/classnames";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "outline";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900",
  secondary: "btn-secondary focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800",
  ghost: "btn-ghost focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800",
  danger: "btn-danger focus:ring-4 focus:ring-rose-100 dark:focus:ring-rose-900",
  success: "btn-success focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900",
  outline: "btn-outline focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1.5 text-xs gap-1.5",
  sm: "px-3 py-2 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-5 py-3 text-base gap-2",
  xl: "px-6 py-4 text-lg gap-2.5",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(
  (
    {
      children,
      className,
      size = "md",
      variant = "primary",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={classNames(
          "btn",
          variantClasses[variant],
          sizeClasses[size],
          isLoading && "cursor-wait opacity-75",
          className
        )}
        disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span className={isLoading ? "opacity-0" : ""}>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
