import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export const CardFooter = forwardRef<HTMLDivElement, PropsWithChildren<{
  className?: string;
}> & ComponentPropsWithoutRef<"div">>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("ui-card__footer", className)} {...props}>
      {children}
    </div>
  )
);

CardFooter.displayName = "CardFooter";
