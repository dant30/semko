import type { PropsWithChildren } from "react";

export function FilterPill({ children }: PropsWithChildren) {
  return <button className="ui-filter-pill" type="button">{children}</button>;
}
