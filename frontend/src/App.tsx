import { RouterProvider } from "react-router-dom";
import { Suspense } from "react";

import { AppProviders } from "@/core/contexts/AppProviders";
import { router } from "@/core/router/router";
import { Skeleton } from "@/shared/components/ui";

function AppLoadingPlaceholder() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-12">
      <div className="w-full max-w-4xl space-y-3">
        <div className="h-8 w-48 rounded-lg ui-skeleton" />
        <div className="h-6 w-32 rounded-lg ui-skeleton" />
        <div className="h-24 w-full rounded-2xl ui-skeleton" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProviders>
      <Suspense fallback={<AppLoadingPlaceholder />}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProviders>
  );
}
