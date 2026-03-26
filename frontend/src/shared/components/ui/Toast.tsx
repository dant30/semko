import type { PropsWithChildren } from "react";

import { cn } from "@/shared/utils/classnames";

export function Toast({
  children,
  title,
  tone = "info",
}: PropsWithChildren<{ title?: string; tone?: "success" | "info" | "warning" | "danger" }>) {
  return (
    <div
      className={cn(
        "pointer-events-auto rounded-2xl border px-4 py-4 shadow-hard backdrop-blur",
        tone === "success" && "border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-100",
        tone === "info" && "border-accent-200 bg-white/95 text-slate-900 dark:border-accent-900 dark:bg-slate-900/95 dark:text-slate-100",
        tone === "warning" && "border-amber-200 bg-amber-50/95 text-amber-900 dark:border-amber-900 dark:bg-amber-950/90 dark:text-amber-100",
        tone === "danger" && "border-rose-200 bg-rose-50/95 text-rose-900 dark:border-rose-900 dark:bg-rose-950/90 dark:text-rose-100"
      )}
      role="status"
    >
      {title ? <p className="text-sm font-semibold">{title}</p> : null}
      <p className={cn("text-sm", title && "mt-1")}>{children}</p>
    </div>
  );
}
