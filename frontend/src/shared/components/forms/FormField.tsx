import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

import { classNames } from "@/shared/utils/classnames";
import ValidationErrors from "./ValidationErrors";

interface FormFieldProps {
  id?: string;
  label?: ReactNode;
  required?: boolean;
  hint?: string;
  errors?: string | string[];
  children: ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  required = false,
  hint,
  errors = [],
  children,
  className = "",
}: FormFieldProps) {
  const normalizedErrors = Array.isArray(errors)
    ? errors.filter(Boolean)
    : errors
    ? [String(errors)]
    : [];
  const hasErrors = normalizedErrors.length > 0;
  const hintId = hint && id ? `${id}-hint` : undefined;
  const errorId = hasErrors && id ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const enhancedChild = isValidElement(children)
    ? cloneElement(children as ReactElement, {
        id: children.props.id || id,
        "aria-invalid": hasErrors ? "true" : children.props["aria-invalid"],
        "aria-describedby":
          [children.props["aria-describedby"], describedBy].filter(Boolean).join(" ") || undefined,
      })
    : children;

  return (
    <div className={classNames("grid gap-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="ui-label">
          {label}
          {required ? <span className="ml-1 text-danger-600">*</span> : null}
        </label>
      ) : null}
      <div className={hasErrors ? "rounded-md ring-1 ring-danger-200 dark:ring-danger-900/40" : ""}>
        {enhancedChild}
      </div>
      {hint && !hasErrors ? (
        <p id={hintId} className="ui-help">
          {hint}
        </p>
      ) : null}
      <ValidationErrors id={errorId} errors={normalizedErrors} />
    </div>
  );
}
