import type { PropsWithChildren } from "react";

export function TableHint({ children }: PropsWithChildren) {
  return <div className="ui-table-hint">{children}</div>;
}
