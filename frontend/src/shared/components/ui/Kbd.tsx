import type { PropsWithChildren } from "react";

export function Kbd({ children }: PropsWithChildren) {
  return <kbd className="ui-kbd">{children}</kbd>;
}
