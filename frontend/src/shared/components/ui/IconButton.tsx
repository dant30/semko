import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export function IconButton(
  props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>
) {
  return <button className="ui-icon-button" {...props} />;
}
