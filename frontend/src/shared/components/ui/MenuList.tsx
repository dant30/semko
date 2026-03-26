import type { PropsWithChildren } from "react";

export function MenuList({ children }: PropsWithChildren) {
  return <ul className="ui-menu-list">{children}</ul>;
}
