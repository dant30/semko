import type { InputHTMLAttributes } from "react";

import { Input } from "./Input";

export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <Input type="search" {...props} />;
}
