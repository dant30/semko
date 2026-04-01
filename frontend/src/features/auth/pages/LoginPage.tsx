// frontend/src/features/auth/pages/LoginPage.tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { APP_NAME, APP_TAGLINE } from "@/core/constants/app";
import { appRoutes } from "@/core/constants/routes";
import { useAuthContext } from "@/features/auth/store/auth-context";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { PasswordInput } from "@/shared/components/ui/PasswordInput";

export function LoginPage() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login({ username, password });
      navigate(appRoutes.dashboard, { replace: true });
    } catch (err) {
      const errPayload = err as { response?: { data?: { detail?: string } } };
      const message =
        errPayload.response?.data?.detail ||
        "We could not sign you in. Please confirm your credentials.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-shell">
      <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <div className="container-wide flex items-center py-16 lg:py-24">
          <div className="max-w-2xl space-y-6 animate-slide-up">
            <Badge>SEMKO Integrated Management System</Badge>
            <div className="space-y-4">
              <h1 className="max-w-xl text-balance">{APP_NAME}</h1>
              <p className="max-w-2xl text-lg text-app-secondary">{APP_TAGLINE}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {["Trips and dispatch", "Inventory and fuel", "Maintenance and payroll"].map(
                (item) => (
                  <span
                    className="rounded-full border border-white/60 bg-white/60 px-4 py-2 text-sm font-semibold text-brand-800 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/50 dark:text-brand-100"
                    key={item}
                  >
                    {item}
                  </span>
                )
              )}
            </div>

            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              <div className="app-panel p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                  Control
                </p>
                <h3 className="mt-2 text-lg">One command surface</h3>
                <p className="mt-2 text-sm">Operations, payroll, maintenance, and governance.</p>
              </div>
              <div className="app-panel p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                  Visibility
                </p>
                <h3 className="mt-2 text-lg">Real-time readiness</h3>
                <p className="mt-2 text-sm">Know what is moving, pending, overdue, or blocked.</p>
              </div>
              <div className="app-panel p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                  Governance
                </p>
                <h3 className="mt-2 text-lg">Built for auditability</h3>
                <p className="mt-2 text-sm">Permissions, traceability, approvals, and reports.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 lg:p-10">
          <Card className="w-full max-w-xl rounded-[2rem] border-white/70 bg-white/88 p-8 shadow-medium backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-950/75">
            <div className="space-y-2">
              <h2>Sign in</h2>
              <p>Access trips, payroll, operations, and governance in one place.</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="form-group">
                <span className="form-label">Username</span>
                <Input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </label>

              <label className="form-group">
                <span className="form-label">Password</span>
                <PasswordInput
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </label>

              {error ? <p className="form-error">{error}</p> : null}

              <Button className="w-full" disabled={submitting} size="lg" type="submit">
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}