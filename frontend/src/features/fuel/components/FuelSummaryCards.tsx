import { Droplets, Gauge, Receipt, Route, TrendingUp, Warehouse } from "lucide-react";

import type { FuelSummaryMetrics } from "@/features/fuel/types/fuel";
import { Card, Skeleton } from "@/shared/components/ui";

const cardConfig = [
  { icon: Warehouse, key: "activeStations", label: "Active stations" },
  { icon: Droplets, key: "fuelVolume", label: "Fuel volume" },
  { icon: Receipt, key: "totalFuelSpend", label: "Fuel spend" },
  { icon: Gauge, key: "fullTankTransactions", label: "Full tank fills" },
  { icon: Route, key: "trackedConsumptionPeriods", label: "Consumption periods" },
  { icon: TrendingUp, key: "averageKmPerLitre", label: "Average km/l" },
] as const;

export function FuelSummaryCards({
  isLoading = false,
  summary,
}: {
  isLoading?: boolean;
  summary: FuelSummaryMetrics;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        return (
          <Card className="rounded-[1.75rem] p-5" key={card.key}>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton />
                <Skeleton />
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                    {card.label}
                  </p>
                  <h3 className="mt-3 text-3xl">
                    {summary[card.key].toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </h3>
                </div>
                <div className="rounded-2xl bg-gradient-card p-3 text-brand-700 dark:text-brand-200">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </section>
  );
}
