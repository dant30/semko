import type { PropsWithChildren } from "react";

export function PageHeading({ children }: PropsWithChildren) {
  return <h1 className="ui-page-heading">{children}</h1>;
}
