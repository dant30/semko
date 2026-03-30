import { Card } from "@/shared/components/ui/Card";
import type { DashboardMetric } from "@/features/dashboard/types/dashboard";

type DashboardSummaryCardsProps = {
  metrics: DashboardMetric[];
};

const toneClasses: Record<NonNullable<DashboardMetric["tone"]>, string> = {
  default: "text-app-primary",
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-rose-600",
};

export function DashboardSummaryCards({ metrics }: DashboardSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <Card className="hover-lift rounded-3xl border-white/70 p-5" key={metric.label}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.25em] text-app-muted">
              {metric.label}
            </span>
            <span className={`text-xs font-semibold ${toneClasses[metric.tone ?? "default"]}`}>
              {metric.tone?.toUpperCase() ?? "LIVE"}
            </span>
          </div>

          <strong className={`mt-4 block text-3xl ${toneClasses[metric.tone ?? "default"]}`}>
            {metric.value}
          </strong>

          {metric.details?.length ? (
            <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-sm text-app-muted">
              {metric.details.map((detail) => (
                <div key={detail.label} className="flex items-center justify-between gap-3">
                  <span>{detail.label}</span>
                  <span className={`font-semibold ${toneClasses[detail.tone ?? "default"]}`}>
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
