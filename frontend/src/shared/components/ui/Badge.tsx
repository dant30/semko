import { forwardRef } from "react";

import { cn } from "@/lib/utils";

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
  brand: "inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-800",
  accent: "inline-flex items-center gap-2 rounded-full border border-accent-100 bg-accent-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent-800",
  success: "inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800",
  warning: "inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800",
  danger: "inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-rose-800",
  neutral: "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700",
  outline: "inline-flex items-center gap-2 rounded-full border-2 border-slate-300 bg-transparent px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700",
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
        className={cn(variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
