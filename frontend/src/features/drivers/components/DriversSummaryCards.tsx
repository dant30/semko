import { AlertTriangle, CheckCircle2, Clock3, UserRoundCheck } from "lucide-react";

import type { DriversSummaryMetrics } from "@/features/drivers/types/driver";
import { Card } from "@/shared/components/ui/Card";

export function DriversSummaryCards({
  isLoading,
  summary,
}: {
  isLoading: boolean;
  summary: DriversSummaryMetrics;
}) {
  const cards = [
    {
      description: "Drivers currently active and available in the transport workforce.",
      icon: UserRoundCheck,
      label: "Active drivers",
      value: summary.activeDrivers,
    },
    {
      description: "Licenses currently valid and compliant in the driver register.",
      icon: CheckCircle2,
      label: "Valid licenses",
      value: summary.validLicenses,
    },
    {
      description: "Driver licenses approaching expiry within the next 30 days.",
      icon: Clock3,
      label: "Expiring soon",
      value: summary.expiringSoon,
    },
    {
      description: "Drivers or license records currently suspended, revoked, or escalated.",
      icon: AlertTriangle,
      label: "Attention needed",
      value: summary.suspendedDrivers + summary.withExpiredLicenses,
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
