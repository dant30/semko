import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";

import { classNames } from "@/shared/utils/classnames";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-sm",
  lg: "px-4 py-3.5 text-base",
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, resize = "vertical", size = "md", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={classNames(
          "form-textarea ui-focus",
          sizeClasses[size],
          resize === "none" && "resize-none",
          resize === "vertical" && "resize-y",
          resize === "horizontal" && "resize-x",
          resize === "both" && "resize",
          error && "border-rose-300 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-600 dark:focus:border-rose-500 dark:focus:ring-rose-900",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
