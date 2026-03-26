import type { PropsWithChildren } from "react";

export function Dropdown({ children }: PropsWithChildren) {
  return <div className="ui-dropdown">{children}</div>;
}
