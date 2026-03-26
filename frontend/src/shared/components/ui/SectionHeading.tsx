import type { PropsWithChildren } from "react";

export function SectionHeading({ children }: PropsWithChildren) {
  return <h2 className="ui-section-heading">{children}</h2>;
}
