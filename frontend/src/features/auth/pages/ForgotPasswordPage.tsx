// frontend/src/features/auth/pages/ChangePasswordPage.tsx
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { authApi } from "@/features/auth/services/auth.api";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setIsLoading(true);

    try {
      await authApi.forgotPassword({ email });
      setMessage("If the email matches an active account, where is a reset link.");
      setEmail("");
    } catch {
      setError("Unable to send password reset instructions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-shell">
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl p-8">
          <Badge>Forgot password</Badge>
          <h1 className="mt-4 text-2xl">Recover your account</h1>
          <p className="mt-2 text-sm text-app-secondary">
            We will send a password reset link to your email address if it exists.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="form-group">
              <span className="form-label">Email</span>
              <Input
                value={email}
                type="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}
            {message ? <p className="form-success">{message}</p> : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send reset link"}
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
