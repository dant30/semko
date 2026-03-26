import type { PropsWithChildren } from "react";

import { classNames } from "@/shared/utils/classnames";

export function Panel({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <section className={classNames("app-panel", className)}>{children}</section>;
}
