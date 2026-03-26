import type { PropsWithChildren } from "react";

export function AlertTitle({ children }: PropsWithChildren) {
  return <strong className="ui-alert__title">{children}</strong>;
}
