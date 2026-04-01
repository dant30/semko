import type { ButtonHTMLAttributes } from "react";

import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/classnames";

interface FormActionsProps {
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  secondaryProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  align?: "left" | "center" | "right";
  loading?: boolean;
  className?: string;
}

export default function FormActions({
  primaryLabel = "Save",
  secondaryLabel = "Cancel",
  primaryProps = {},
  secondaryProps = {},
  align = "right",
  loading = false,
  className = "",
}: FormActionsProps) {
  const alignmentClass =
    align === "left" ? "justify-start" : align === "center" ? "justify-center" : "justify-end";

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 border-t border-surface-border pt-3",
        alignmentClass,
        className
      )}
      role="group"
      aria-label="Form actions"
    >
      {secondaryLabel ? (
        <Button variant="secondary" {...secondaryProps}>
          {secondaryLabel}
        </Button>
      ) : null}
      <Button variant="primary" isLoading={loading} {...primaryProps}>
        {primaryLabel}
      </Button>
    </div>
  );
}
