import { Card } from "@/shared/components/ui/Card";
import { DataTable, type Column } from "@/shared/components/tables";
import type { DashboardAlert } from "@/features/dashboard/types/dashboard";

type DashboardAlertsPanelProps = {
  alerts: DashboardAlert[];
};

export function DashboardAlertsPanel({ alerts }: DashboardAlertsPanelProps) {
  const columns: Column<DashboardAlert>[] = [
    {
      key: "type",
      header: "Type",
      accessor: (row) => (
        <span className={`rounded-full px-3 py-1 text-xs uppercase ${
          row.type === "danger"
            ? "bg-rose-100 text-rose-700"
            : row.type === "warning"
            ? "bg-amber-100 text-amber-700"
            : row.type === "success"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-700"
        }`}>
          {row.type}
        </span>
      ),
      width: "20%",
    },
    {
      key: "title",
      header: "Alert",
      accessor: (row) => <span className="font-semibold text-app-primary">{row.title}</span>,
      width: "40%",
    },
    {
      key: "count",
      header: "Count",
      accessor: (row) => <span className="font-semibold">{row.count}</span>,
      width: "15%",
    },
    {
      key: "link",
      header: "Action",
      accessor: (row) => (
        <a href={row.url} className="text-brand-600 underline" target="_blank" rel="noreferrer">
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
          <h3 className="text-lg font-semibold">Alerts</h3>
          <p className="mt-2 text-sm text-app-muted">
            Active warnings and items requiring attention.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.25em] text-app-muted">
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
