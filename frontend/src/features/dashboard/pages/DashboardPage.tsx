import { useState } from "react";
import { useAppSelector } from "@/core/store/hooks";
import { DashboardAlertsPanel, DashboardCharts, DashboardSummaryCards } from "@/features/dashboard/components";
import { useDashboardWorkspace } from "@/features/dashboard/hooks";
import { Button, Card, Input, PageHeading } from "@/shared/components/ui";
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
        <PageHeading className="text-app-primary">{headerTitle}</PageHeading>
        <p className="text-sm text-app-muted">{lastUpdatedLabel}</p>
      </div>
      <Button type="button" variant="secondary" onClick={() => void refresh()}>
        Refresh
      </Button>
    </section>
  );

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {header}
        <Card variant="outlined" className="mt-6 border-app-border bg-app-surface p-8 text-center text-sm text-app-muted">
          Loading dashboard summary...
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {header}
        <Card className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
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

      <Card className="grid gap-4 rounded-3xl border border-app-border bg-white/80 p-6 shadow-soft backdrop-blur-sm md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-lg font-semibold text-app-primary">Alert center</h2>
          <p className="mt-1 text-sm text-app-muted">Search active warnings and review the latest notifications.</p>
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
