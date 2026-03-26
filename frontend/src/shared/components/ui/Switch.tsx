import type { InputHTMLAttributes } from "react";

export function Switch(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="ui-switch" type="checkbox" {...props} />;
}
