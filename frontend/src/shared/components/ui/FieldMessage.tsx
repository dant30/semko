import type { PropsWithChildren } from "react";

export function FieldMessage({ children }: PropsWithChildren) {
  return <p className="ui-field-message">{children}</p>;
}
