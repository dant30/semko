// frontend/src/features/dashboard/components/DashboardSummaryCards.tsx
import { Card } from "@/shared/components/ui/Card";
import type { DashboardMetric } from "@/features/dashboard/types/dashboard";

type DashboardSummaryCardsProps = {
  metrics: DashboardMetric[];
};

const toneClasses: Record<NonNullable<DashboardMetric["tone"]>, string> = {
  default: "text-text-primary",
  success: "text-success-600 dark:text-success-400",
  warning: "text-warning-600 dark:text-warning-400",
  danger: "text-danger-600 dark:text-danger-400",
};

const trendClasses: Record<NonNullable<DashboardMetric["trend"]>["direction"], string> = {
  up: "text-success-600 dark:text-success-400",
  down: "text-danger-600 dark:text-danger-400",
  flat: "text-text-muted",
};

export function DashboardSummaryCards({ metrics }: DashboardSummaryCardsProps) {
  if (!metrics.length) {
    return (
      <div className="text-center py-8 text-text-muted">
        No metrics available
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <Card className="hover-lift rounded-3xl border-surface-border p-5 transition-all duration-200" key={metric.label}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-wide text-text-muted font-medium">
              {metric.label}
            </span>
            <span className={`text-xs font-semibold ${toneClasses[metric.tone ?? "default"]}`}>
              {metric.tone?.toUpperCase() ?? "LIVE"}
            </span>
          </div>

          <strong className={`mt-4 block text-3xl ${toneClasses[metric.tone ?? "default"]}`}>
            {metric.value}
          </strong>

          {metric.trend ? (
            <p className={`mt-3 text-sm font-semibold ${trendClasses[metric.trend.direction]}`}>
              {metric.trend.label}
            </p>
          ) : null}

          {metric.details?.length ? (
            <div className="mt-5 space-y-3 border-t border-surface-border pt-4 text-sm text-text-muted">
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
