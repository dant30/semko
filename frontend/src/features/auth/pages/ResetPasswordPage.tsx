// frontend/src/features/auth/pages/ResetPasswordPage.tsx
import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { authApi } from "@/features/auth/services/auth.api";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { PasswordInput } from "@/shared/components/ui/PasswordInput";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const uid = useMemo(() => searchParams.get("uid") ?? "", [searchParams]);
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!uid || !token) {
      setError("Reset token or UID is missing.");
      return;
    }

    if (!newPassword || newPassword !== newPasswordConfirm) {
      setError("Passwords must match and cannot be empty.");
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({ uid, token, new_password: newPassword, new_password_confirm: newPasswordConfirm });
      setMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate(appRoutes.login), 1500);
    } catch {
      setError("Unable to reset password. Please check token and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-shell">
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl p-8">
          <Badge>Password reset</Badge>
          <h1 className="mt-4 text-2xl">Set a new password</h1>
          <p className="mt-2 text-sm text-app-secondary">
            Enter a new password for your account.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="form-group">
              <span className="form-label">New password</span>
              <PasswordInput
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </label>

            <label className="form-group">
              <span className="form-label">Confirm new password</span>
              <PasswordInput
                value={newPasswordConfirm}
                onChange={(event) => setNewPasswordConfirm(event.target.value)}
                required
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}
            {message ? <p className="form-success">{message}</p> : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Updating..." : "Set new password"}
            </Button>
          </form>

          <div className="mt-4 text-sm text-app-secondary">
            <Link to={appRoutes.login} className="text-brand-600 hover:text-brand-700">
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
