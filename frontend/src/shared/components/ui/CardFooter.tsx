import type { PropsWithChildren } from "react";

export function CardFooter({ children }: PropsWithChildren) {
  return <div className="ui-card__footer">{children}</div>;
}
