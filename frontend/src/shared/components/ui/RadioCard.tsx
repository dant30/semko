import type { InputHTMLAttributes } from "react";

export function RadioCard(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="ui-radio-card" type="radio" {...props} />;
}
