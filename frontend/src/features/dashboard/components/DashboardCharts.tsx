import { Card } from "@/shared/components/ui/Card";
import { formatNumber } from "@/shared/utils/number";
import type { DashboardSummaryPayload } from "@/features/dashboard/types/dashboard";

type DashboardChartsProps = {
  summary: DashboardSummaryPayload;
};

function getWidthClass(value: number, maxValue: number) {
  const ratio = maxValue === 0 ? 0 : (value / maxValue) * 100;
  const width = Math.max(8, Math.min(100, Math.round(ratio)));

  if (width >= 100) return "w-full";
  if (width >= 90) return "w-[90%]";
  if (width >= 80) return "w-[80%]";
  if (width >= 70) return "w-[70%]";
  if (width >= 60) return "w-[60%]";
  if (width >= 50) return "w-[50%]";
  if (width >= 40) return "w-[40%]";
  if (width >= 30) return "w-[30%]";
  if (width >= 20) return "w-[20%]";
  if (width >= 15) return "w-[15%]";
  if (width >= 10) return "w-[10%]";
  return "w-[8%]";
}

export function DashboardCharts({ summary }: DashboardChartsProps) {
  const activityMetrics = [
    { label: "Trips today", value: summary.trips_today, color: "bg-sky-500" },
    { label: "Trips this week", value: summary.trips_this_week, color: "bg-indigo-500" },
    { label: "Pending requisitions", value: summary.pending_requisitions, color: "bg-amber-500" },
    { label: "Overdue maintenance", value: summary.overdue_maintenance, color: "bg-rose-500" },
  ];

  const fuelMetrics = [
    { label: "Fuel today", value: summary.fuel_today_litres, color: "bg-cyan-500" },
    { label: "Fuel this month", value: summary.fuel_this_month_litres, color: "bg-blue-500" },
  ];

  const activityMax = Math.max(...activityMetrics.map((item) => item.value), 1);
  const fuelMax = Math.max(...fuelMetrics.map((item) => item.value), 1);
  const fuelRatio = summary.fuel_this_month_litres
    ? Math.min(100, Math.round((summary.fuel_today_litres / summary.fuel_this_month_litres) * 100))
    : 0;

  return (
    <Card className="rounded-3xl border border-app-border p-6">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-app-muted">Live analytics</p>
          <h3 className="mt-2 text-xl font-semibold text-app-primary">Operations overview</h3>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold">Activity levels</h4>
                <p className="text-sm text-app-muted">Volume across key operational metrics.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.25em] text-app-muted">
                {formatNumber(activityMax)} max
              </span>
            </div>

            <div className="space-y-4">
              {activityMetrics.map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-app-muted">
                    <span>{metric.label}</span>
                    <span>{formatNumber(metric.value)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`${metric.color} h-full rounded-full transition-all duration-300 ${getWidthClass(
                        metric.value,
                        activityMax
                      )}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold">Fuel usage</h4>
              <p className="text-sm text-app-muted">Daily and monthly consumption.</p>
            </div>

            <div className="space-y-4">
              {fuelMetrics.map((fuel) => (
                <div key={fuel.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-app-muted">
                    <span>{fuel.label}</span>
                    <span>{formatNumber(fuel.value)} L</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`${fuel.color} h-full rounded-full transition-all duration-300 ${getWidthClass(
                        fuel.value,
                        fuelMax
                      )}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-app-muted">
              <div className="flex items-center justify-between">
                <span>Today vs month</span>
                <strong className="text-app-primary">{fuelRatio}%</strong>
              </div>
              <p className="mt-2 text-sm">
                Today&apos;s fuel usage is {fuelRatio}% of the current month&apos;s total consumption.
              </p>
            </div>
          </section>
        </div>
      </div>
    </Card>
  );
}