import type { PropsWithChildren, ReactNode } from "react";

import { classNames } from "@/shared/utils/classnames";

interface FormSectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  actions,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <section className={classNames("ui-form-section anim-fade-in", className)}>
      {(title || description || actions) && (
        <header className="ui-form-section-header">
          <div>
            {title ? <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3> : null}
            {description ? <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p> : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </header>
      )}
      <div className="ui-form-section-body">{children}</div>
    </section>
  );
}
