import { useState, type InputHTMLAttributes } from "react";

import { Input } from "./Input";
import { Button } from "./Button";

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input className="pr-24" type={visible ? "text" : "password"} {...props} />
      <Button
        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5"
        onClick={() => setVisible((current) => !current)}
        size="sm"
        type="button"
        variant="ghost"
      >
        {visible ? "Hide" : "Show"}
      </Button>
    </div>
  );
}
