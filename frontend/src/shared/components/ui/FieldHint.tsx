import type { PropsWithChildren } from "react";

export function FieldHint({ children }: PropsWithChildren) {
  return <small className="ui-field-hint">{children}</small>;
}
