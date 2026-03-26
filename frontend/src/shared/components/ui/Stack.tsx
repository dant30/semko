import type { PropsWithChildren } from "react";

export function Stack({ children }: PropsWithChildren) {
  return <div className="ui-stack">{children}</div>;
}
