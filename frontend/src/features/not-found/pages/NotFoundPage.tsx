// frontend/src/features/not-found/pages/NotFoundPage.tsx
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";

import { Button, Heading, Stack } from "@/shared/components/ui";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-shell flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface-subtle">
          <AlertTriangle className="h-12 w-12 text-warning-500" />
        </div>

        {/* Error code */}
        <Heading level={1} className="text-7xl font-extrabold tracking-tighter text-brand-600 dark:text-brand-400">
          404
        </Heading>

        {/* Message */}
        <Heading level={2} className="mt-4 text-2xl font-semibold text-text-primary">
          Page not found
        </Heading>
        <p className="mt-2 text-text-muted">
          Sorry, we couldn’t find the page you’re looking for. It might have been moved or deleted.
        </p>

        {/* Action buttons */}
        <Stack direction="row" justify="center" spacing="md" className="mt-8">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
          <Button variant="primary" onClick={() => navigate("/app/dashboard")}>
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Stack>

        {/* Optional: search suggestion or contact link */}
        <p className="mt-8 text-xs text-text-muted">
          Need help?{" "}
          <a href="/support" className="text-accent-600 hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}