import type { PropsWithChildren } from "react";

import { classNames } from "@/shared/utils/classnames";

export function FormSection({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <section className={classNames("app-panel p-6", className)}>{children}</section>;
}
