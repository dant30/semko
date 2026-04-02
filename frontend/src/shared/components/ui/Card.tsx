import type { PropsWithChildren } from "react";
import { forwardRef } from "react";

import { cn } from '@/shared/utils/classnames';

type CardVariant = "default" | "elevated" | "outlined" | "filled";
type CardPadding = "none" | "sm" | "md" | "lg" | "xl";

const variantClasses: Record<CardVariant, string> = {
  default: "card",
  elevated: "card shadow-medium",
  outlined: "card border-2 border-surface-border",
  filled: "card bg-surface-subtle",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  as?: "div" | "section" | "article";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      variant = "default",
      padding = "md",
      hover = false,
      as: Component = "div",
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          variantClasses[variant],
          paddingClasses[padding],
          hover && "hover-lift",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = "Card";

// Sub-components for better structure
export function CardHeader({
  children,
  className,
  ...props
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("card-header", className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className,
  ...props
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("card-body", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("card-footer", className)} {...props}>
      {children}
    </div>
  );
}
