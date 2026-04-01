import { classNames } from "@/shared/utils/classnames";

interface ValidationErrorsProps {
  id?: string;
  errors?: string[];
  className?: string;
}

export default function ValidationErrors({
  id,
  errors = [],
  className = "",
}: ValidationErrorsProps) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <ul id={id} className={classNames("grid gap-1", className)} role="alert" aria-live="polite">
      {errors.map((error, index) => (
        <li key={`${error}-${index}`} className="ui-error text-xs">
          {error}
        </li>
      ))}
    </ul>
  );
}
