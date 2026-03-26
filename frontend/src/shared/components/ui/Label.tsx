import type { LabelHTMLAttributes, PropsWithChildren } from "react";

export function Label(
  props: PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>
) {
  const { children, ...rest } = props;
  return <label className="ui-label" {...rest}>{children}</label>;
}
