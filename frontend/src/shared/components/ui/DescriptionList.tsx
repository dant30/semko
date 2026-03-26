import type { PropsWithChildren } from "react";

export function DescriptionList({ children }: PropsWithChildren) {
  return <dl className="ui-description-list">{children}</dl>;
}
