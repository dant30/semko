import type { PropsWithChildren } from "react";

export function CardHeader({ children }: PropsWithChildren) {
  return <div className="ui-card__header">{children}</div>;
}
