// frontend/src/shared/components/layout/Footer.tsx
import { Globe, ShieldCheck } from "lucide-react";

import { Badge, Stack } from "@/shared/components/ui";
import { APP_NAME } from "@/core/constants/app";

export function Footer() {
  return (
    <footer
      role="contentinfo"
      aria-label="Site footer"
      className="mt-8 border-t border-surface-border bg-white/80 shadow-sm backdrop-blur dark:bg-slate-900/80"
    >
      <div className="container-fluid py-4">
        <Stack direction="row" justify="between" align="center" className="flex-wrap gap-3">
          <div className="text-center md:text-left">
            <Stack direction="row" align="center" spacing="sm" className="mb-1 justify-center md:justify-start">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-primary text-xs font-bold text-white">
                S
              </div>
              <span className="text-sm font-bold text-app-primary">{APP_NAME}</span>
            </Stack>
            <p className="text-xs text-app-muted">Fleet, payroll, and operations workspace.</p>
          </div>

          <Stack direction="row" align="center" spacing="md" className="text-xs text-app-muted">
            <Badge variant="success" className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              System online
            </Badge>
            <div className="hidden items-center gap-1.5 sm:flex">
              <Globe className="h-3 w-3" />
              <span>API linked</span>
            </div>
            <div className="hidden items-center gap-1.5 lg:flex">
              <ShieldCheck className="h-3 w-3" />
              <span>Secure operations</span>
            </div>
          </Stack>
        </Stack>
      </div>
    </footer>
  );
}
