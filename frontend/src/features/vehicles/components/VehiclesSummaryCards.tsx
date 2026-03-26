import { AlertTriangle, Building2, ShieldCheck, Tags } from "lucide-react";

import type { VehicleSummaryMetrics } from "@/features/vehicles/types/vehicle";
import { Card } from "@/shared/components/ui/Card";

export function VehiclesSummaryCards({
  isLoading,
  summary,
}: {
  isLoading: boolean;
  summary: VehicleSummaryMetrics;
}) {
  const cards = [
    {
      icon: Tags,
      label: "Vehicle types",
      value: summary.vehicleTypes,
      description: "Defined fleet classifications and standard transport categories.",
    },
    {
      icon: Building2,
      label: "Ownership records",
      value: summary.ownershipRecords,
      description: "Internal, leased, hired, and contracted ownership profiles in the register.",
    },
    {
      icon: ShieldCheck,
      label: "Insurance due soon",
      value: summary.insuranceDueSoon,
      description: "Vehicles with insurance expiry approaching within the next 30 days.",
    },
    {
      icon: AlertTriangle,
      label: "Company-owned units",
      value: summary.internalOwnerships,
      description: "Fleet assets currently tagged as company-owned in the ownership register.",
    },
  ];

  return (
    <section className="grid gap-4 lg:grid-cols-4">
      {cards.map(({ description, icon: Icon, label, value }) => (
        <Card className="rounded-[1.75rem] p-5" key={label}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-app-muted">
                {label}
              </p>
              <h3 className="mt-3 text-3xl">{isLoading ? "--" : value}</h3>
              <p className="mt-2 text-sm text-app-secondary">{description}</p>
            </div>
            <div className="rounded-2xl bg-gradient-card p-3 text-brand-700 dark:text-brand-200">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}
    </section>
  );
}
