import type { PropsWithChildren } from "react";
import { forwardRef } from "react";

import { classNames } from "@/shared/utils/classnames";

type BadgeVariant =
  | "brand"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "outline";
type BadgeSize = "xs" | "sm" | "md";

const variantClasses: Record<BadgeVariant, string> = {
  brand: "inline-flex items-center gap-1 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-800 dark:border-brand-900 dark:bg-brand-900 dark:text-brand-200",
  accent: "inline-flex items-center gap-1 rounded-full border border-accent-100 bg-accent-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent-800 dark:border-accent-900 dark:bg-accent-900 dark:text-accent-200",
  success: "inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800 dark:border-emerald-900 dark:bg-emerald-900 dark:text-emerald-200",
  warning: "inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800 dark:border-amber-900 dark:bg-amber-900 dark:text-amber-200",
  danger: "inline-flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-rose-800 dark:border-rose-900 dark:bg-rose-900 dark:text-rose-200",
  neutral: "inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  outline: "inline-flex items-center gap-1 rounded-full border-2 border-slate-300 bg-transparent px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 dark:border-slate-600 dark:text-slate-300",
};

const sizeClasses: Record<BadgeSize, string> = {
  xs: "px-2 py-0.5 text-xs gap-1",
  sm: "px-2.5 py-1 text-xs gap-1",
  md: "px-3 py-1.5 text-sm gap-1.5",
};

export interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, className, variant = "brand", size = "sm", dot = false, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={classNames(variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {dot && (
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
