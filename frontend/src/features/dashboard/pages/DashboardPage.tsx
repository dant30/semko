// frontend/src/features/dashboard/pages/DashboardPage.tsx
import { useState } from "react";
import { useAppSelector } from "@/core/store/hooks";
import { DashboardAlertsPanel, DashboardCharts, DashboardSummaryCards } from "@/features/dashboard/components";
import { useDashboardWorkspace } from "@/features/dashboard/hooks";
import { Button, Card, Input, PageHeading, Skeleton } from "@/shared/components/ui";
import { FormField } from "@/shared/components/forms";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const metrics = useAppSelector((state) => state.dashboard.metrics);
  const { isLoading, error, alerts, summary, lastUpdated, refresh } = useDashboardWorkspace();
  const [alertSearch, setAlertSearch] = useState("");

  const userName = user
    ? user.first_name
      ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
      : user.username
    : "there";

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  const headerTitle = `${greeting}, ${userName}`;

  const lastUpdatedLabel = lastUpdated
    ? `Last updated: ${new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(lastUpdated)}`
    : "Loading latest metrics...";

  const filteredAlerts = alerts.filter((alert) => {
    const query = alertSearch.trim().toLowerCase();
    return (
      alert.title.toLowerCase().includes(query) ||
      alert.url.toLowerCase().includes(query) ||
      alert.type.toLowerCase().includes(query)
    );
  });

  const header = (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <PageHeading className="text-text-primary">{headerTitle}</PageHeading>
        <p className="text-sm text-text-muted">{lastUpdatedLabel}</p>
      </div>
      <Button type="button" variant="secondary" onClick={() => void refresh()} disabled={isLoading}>
        {isLoading ? "Loading..." : "Refresh"}
      </Button>
    </section>
  );

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-24 rounded-lg" />
        </section>

        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="rounded-3xl p-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        <Card className="grid gap-4 rounded-3xl border border-surface-border bg-white/80 p-6 shadow-soft backdrop-blur-sm md:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </Card>

        <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
          <Card className="rounded-3xl border border-surface-border p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-40 rounded-lg" />
              </div>

              <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-52 w-full rounded-lg" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-64 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-20 rounded-lg" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>

              <div className="mt-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 border-b border-surface-border pb-3">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {header}
        <Card className="mt-6 rounded-3xl border border-warning/20 bg-warning/5 p-6">
          <EmptyState
            title="Unable to load dashboard"
            description={error}
            action={
              <Button variant="primary" onClick={() => void refresh()}>
                Retry
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      {header}

      <section className="space-y-4">
        <DashboardSummaryCards metrics={metrics} />
      </section>

      <Card className="grid gap-4 rounded-3xl border border-surface-border bg-white/80 p-6 shadow-soft backdrop-blur-sm md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Alert center</h2>
          <p className="mt-1 text-sm text-text-muted">Search active warnings and review the latest notifications.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <FormField label="Search alerts" className="min-w-0">
            <Input
              placeholder="Search title, type, or URL"
              value={alertSearch}
              onChange={(event) => setAlertSearch(event.target.value)}
            />
          </FormField>
          <Button variant="outline" onClick={() => setAlertSearch("")}>Clear</Button>
        </div>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        {summary && <DashboardCharts summary={summary} />}
        <DashboardAlertsPanel alerts={filteredAlerts} />
      </section>
    </div>
  );
}
