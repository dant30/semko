import { Globe, ShieldCheck } from "lucide-react";

import { APP_NAME } from "@/core/constants/app";

export function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="mt-8 border-t border-surface-border bg-white/80 shadow-sm backdrop-blur dark:bg-slate-900/80"
      role="contentinfo"
    >
      <div className="container-fluid py-4">
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="text-center md:text-left">
            <div className="mb-1 flex items-center justify-center gap-2 md:justify-start">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-primary text-xs font-bold text-white">
                S
              </div>
              <span className="text-sm font-bold text-app-primary">{APP_NAME}</span>
            </div>
            <p className="text-xs text-app-muted">Fleet, payroll, and operations workspace.</p>
          </div>

          <div
            aria-label="System status"
            className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400"
          >
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
              <div aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span>System online</span>
            </div>
            <div className="hidden items-center gap-1.5 sm:flex">
              <Globe aria-hidden="true" className="h-3 w-3" />
              <span>API linked</span>
            </div>
            <div className="hidden items-center gap-1.5 lg:flex">
              <ShieldCheck aria-hidden="true" className="h-3 w-3" />
              <span>Secure operations</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
