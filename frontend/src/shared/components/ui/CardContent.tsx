import type { PropsWithChildren } from "react";

export function CardContent({ children }: PropsWithChildren) {
  return <div className="ui-card__content">{children}</div>;
}
