import { Card } from "@/shared/components/ui/Card";
import type { DashboardAlert } from "@/features/dashboard/types/dashboard";

type DashboardAlertsPanelProps = {
  alerts: DashboardAlert[];
};

export function DashboardAlertsPanel({ alerts }: DashboardAlertsPanelProps) {
  return (
    <Card className="rounded-3xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Alerts</h3>
          <p className="mt-2 text-sm text-app-muted">
            Active warnings and items requiring attention.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.25em] text-app-muted">
          {alerts.length} active
        </span>
      </div>

      <ul className="mt-6 space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <li
              key={`${alert.type}-${alert.title}`}
              className="rounded-2xl border border-app-border p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-app-primary">{alert.title}</span>
                <span className="text-sm text-app-muted">{alert.count}</span>
              </div>
              <div className="mt-2 text-sm text-app-secondary">{alert.url}</div>
            </li>
          ))
        ) : (
          <li className="rounded-2xl border border-app-border p-4 text-sm text-app-muted">
            No active alerts.
          </li>
        )}
      </ul>
    </Card>
  );
}
