import type { PropsWithChildren } from "react";

export function Surface({ children }: PropsWithChildren) {
  return <div className="ui-surface">{children}</div>;
}
