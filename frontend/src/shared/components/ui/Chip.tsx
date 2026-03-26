import type { PropsWithChildren } from "react";

export function Chip({ children }: PropsWithChildren) {
  return <span className="ui-chip">{children}</span>;
}
