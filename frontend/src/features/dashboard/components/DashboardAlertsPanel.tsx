// frontend/src/features/dashboard/components/DashboardAlertsPanel.tsx
import { Card } from "@/shared/components/ui/Card";
import { DataTable, type Column } from "@/shared/components/tables";
import type { DashboardAlert } from "@/features/dashboard/types/dashboard";

type DashboardAlertsPanelProps = {
  alerts: DashboardAlert[];
};

const typeStyles: Record<DashboardAlert["type"], string> = {
  danger: "bg-danger/10 text-danger-800 dark:bg-danger/10 dark:text-danger-300 font-medium",
  warning: "bg-warning/10 text-warning-800 dark:bg-warning/10 dark:text-warning-300 font-medium",
  success: "bg-success/10 text-success-800 dark:bg-success/10 dark:text-success-300 font-medium",
  info: "bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300 font-medium",
};

export function DashboardAlertsPanel({ alerts }: DashboardAlertsPanelProps) {
  const columns: Column<DashboardAlert>[] = [
    {
      key: "type",
      header: "Type",
      accessor: (row) => (
        <span className={`rounded-full px-3 py-1 text-xs uppercase ${typeStyles[row.type]}`}>
          {row.type}
        </span>
      ),
      width: "20%",
    },
    {
      key: "title",
      header: "Alert",
      accessor: (row) => <span className="font-semibold text-text-primary">{row.title}</span>,
      width: "40%",
    },
    {
      key: "count",
      header: "Count",
      accessor: (row) => <span className="font-semibold text-text-primary">{row.count}</span>,
      width: "15%",
    },
    {
      key: "link",
      header: "Action",
      accessor: (row) => (
        <a href={row.url} className="text-accent-600 hover:text-accent-700 underline transition-colors" target="_blank" rel="noreferrer">
          View
        </a>
      ),
      width: "25%",
    },
  ];

  return (
    <Card className="rounded-3xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Alerts</h3>
          <p className="mt-2 text-sm text-text-muted">
            Active warnings and items requiring attention.
          </p>
        </div>
        <span className="rounded-full bg-surface-subtle px-3 py-1 text-xs uppercase tracking-wide text-text-muted font-medium">
          {alerts.length} active
        </span>
      </div>

      <div className="mt-6">
        <DataTable
          data={alerts}
          columns={columns}
          keyPrefix="dashboard-alert"
          emptyMessage="No active alerts found."
        />
      </div>
    </Card>
  );
}
