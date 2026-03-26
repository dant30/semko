import { X } from "lucide-react";
import type { PropsWithChildren, ReactNode } from "react";

interface DrawerProps extends PropsWithChildren {
  description?: string;
  onClose: () => void;
  open: boolean;
  title?: ReactNode;
}

export function Drawer({
  children,
  description,
  onClose,
  open,
  title,
}: DrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        aria-label="Close drawer"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-modal="true"
        className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col border-l border-slate-200 bg-white shadow-hard dark:border-slate-800 dark:bg-slate-950"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="space-y-1">
            {title ? <h3 className="text-xl font-semibold text-app-primary">{title}</h3> : null}
            {description ? <p className="text-sm text-app-secondary">{description}</p> : null}
          </div>
          <button
            aria-label="Close drawer"
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </aside>
    </div>
  );
}
