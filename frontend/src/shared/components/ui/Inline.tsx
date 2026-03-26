import type { PropsWithChildren } from "react";

export function Inline({ children }: PropsWithChildren) {
  return <div className="ui-inline">{children}</div>;
}
