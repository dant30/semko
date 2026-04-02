import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";
import { forwardRef } from "react";

import { cn } from '@/shared/utils/classnames';

export const CardContent = forwardRef<HTMLDivElement, PropsWithChildren<{
  className?: string;
}> & ComponentPropsWithoutRef<"div">>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("ui-card__content", className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = "CardContent";
