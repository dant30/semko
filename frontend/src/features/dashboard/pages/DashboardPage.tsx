import { useAppSelector } from "@/core/store/hooks";
import { DashboardAlertsPanel, DashboardCharts, DashboardSummaryCards } from "@/features/dashboard/components";
import { useDashboardWorkspace } from "@/features/dashboard/hooks";

export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const metrics = useAppSelector((state) => state.dashboard.metrics);
  const { isLoading, error, alerts, summary, lastUpdated, refresh } = useDashboardWorkspace();

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

  const header = (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-app-primary">{headerTitle}</h1>
        <p className="text-sm text-app-muted">{lastUpdatedLabel}</p>
      </div>
      <button
        type="button"
        onClick={() => void refresh()}
        className="inline-flex items-center justify-center rounded-full border border-app-border bg-white px-4 py-2 text-sm font-semibold text-app-primary transition hover:bg-slate-50"
      >
        Refresh
      </button>
    </section>
  );

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {header}
        <div className="mt-6 rounded-3xl border border-app-border bg-app-surface p-8 text-center text-sm text-app-muted">
          Loading dashboard summary...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {header}
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      {header}

      <section className="space-y-4">
        <DashboardSummaryCards metrics={metrics} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        {summary && <DashboardCharts summary={summary} />}
        <DashboardAlertsPanel alerts={alerts} />
      </section>
    </div>
  );
}
