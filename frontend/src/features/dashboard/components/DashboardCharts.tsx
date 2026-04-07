// frontend/src/features/dashboard/components/DashboardCharts.tsx
import { BarChart, ChartCard, GaugeChart } from "@/shared/components/charts";
import { Card } from "@/shared/components/ui/Card";
import { formatNumber } from "@/shared/utils/number";
import type { DashboardSummaryPayload } from "@/features/dashboard/types/dashboard";

type DashboardChartsProps = {
  summary: DashboardSummaryPayload;
};

export function DashboardCharts({ summary }: DashboardChartsProps) {
  const activityData = [
    { label: "Trips today", value: summary.trips_today },
    { label: "Trips this week", value: summary.trips_this_week },
    { label: "Pending requisitions", value: summary.pending_requisitions },
    { label: "Overdue maintenance", value: summary.overdue_maintenance },
  ];

  const fuelData = [
    { label: "Fuel today", value: summary.fuel_today_litres },
    { label: "Fuel this month", value: summary.fuel_this_month_litres },
  ];

  const fuelRatio = summary.fuel_this_month_litres
    ? Math.min(100, Math.round((summary.fuel_today_litres / summary.fuel_this_month_litres) * 100))
    : 0;

  return (
    <Card className="rounded-3xl border border-surface-border p-6">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted font-medium">Live analytics</p>
          <h3 className="mt-2 text-xl font-semibold text-text-primary">Operations overview</h3>
        </div>

        <div className="space-y-6">
          <ChartCard title="Activity snapshot" meta={`${formatNumber(summary.trips_today)} today`}>
            <BarChart data={activityData} title="Activity summary" className="min-h-[280px]" />
          </ChartCard>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <ChartCard title="Fuel consumption" meta={`${formatNumber(summary.fuel_today_litres)} L today`}>
              <BarChart data={fuelData} title="Fuel usage" className="min-h-[240px]" />
            </ChartCard>
            <ChartCard title="Fuel utilization" meta={`${fuelRatio}% of month`}>
              <GaugeChart
                value={fuelRatio}
                min={0}
                max={100}
                unit="%"
                thresholds={{ warning: 50, danger: 80 }}
                className="min-h-[280px]"
              />
            </ChartCard>
          </div>
        </div>
      </div>
    </Card>
  );
}