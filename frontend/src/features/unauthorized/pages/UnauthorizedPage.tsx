// frontend/src/features/unauthorized/pages/UnauthorizedPage.tsx
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { Button } from "@/shared/components/ui/Button";

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 dark:bg-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-4xl flex-col items-center justify-center text-center">
        <div className="w-full rounded-[2rem] border border-slate-200 bg-white/90 px-8 py-12 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300">
            <Lock className="h-10 w-10" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-rose-600 dark:text-rose-300">
            Access declined
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
            You don’t have permission to view this page
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
            The page you tried to reach is restricted. If you believe this is a mistake, contact your administrator or return to a safe place in the app.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              type="button"
              size="lg"
              onClick={() => navigate(appRoutes.dashboard)}
            >
              Go to dashboard
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate(appRoutes.support)}
            >
              Contact support
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
