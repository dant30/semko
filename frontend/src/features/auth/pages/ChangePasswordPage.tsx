// frontend/src/features/auth/pages/ChangePasswordPage.tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { authApi } from "@/features/auth/services/auth.api";
import { useNotifications } from "@/core/contexts/useNotifications";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { PasswordInput } from "@/shared/components/ui/PasswordInput";

export function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await authApi.changePassword({ old_password: oldPassword, new_password: newPassword, new_password_confirm: confirmPassword });
      showToast({ title: "Password changed", message: "Your password has been updated.", tone: "success" });
      navigate(appRoutes.profile);
    } catch {
      setError("Unable to change password. Please check your fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-shell">
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl p-8">
          <Badge>Change password</Badge>
          <h1 className="mt-4 text-2xl">Update your account password</h1>
          <p className="mt-2 text-sm text-app-secondary">For security, do not share your password with others.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="form-group">
              <span className="form-label">Current password</span>
              <PasswordInput
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                required
              />
            </label>

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
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Saving..." : "Change password"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
