import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "outline";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-400",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-300",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300",
  danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-400",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400",
  outline: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus:ring-slate-300",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-3 py-1.5 text-xs gap-1.5",
  sm: "px-3.5 py-2 text-sm gap-2",
  md: "px-4 py-2.5 text-sm gap-2.5",
  lg: "px-5 py-3 text-base gap-2.5",
  xl: "px-6 py-3.5 text-lg gap-3",
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
        className={cn(
          "inline-flex items-center justify-center rounded-xl border font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
          variantClasses[variant],
          sizeClasses[size],
          isLoading && "cursor-wait opacity-80",
          className
        )}
        disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading && (
          <span className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {!isLoading && leftIcon && <span className="mr-2 shrink-0">{leftIcon}</span>}
        <span className={isLoading ? "opacity-0" : ""}>{children}</span>
        {!isLoading && rightIcon && <span className="ml-2 shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
