// frontend/src/shared/components/forms/FormField.tsx
import type { PropsWithChildren } from "react";

import { classNames } from "@/shared/utils/classnames";

export function FormField({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <div className={classNames("form-group", className)}>{children}</div>;
}
