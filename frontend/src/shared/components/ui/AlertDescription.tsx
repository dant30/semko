import type { PropsWithChildren } from "react";

export function AlertDescription({ children }: PropsWithChildren) {
  return <p className="ui-alert__description">{children}</p>;
}
