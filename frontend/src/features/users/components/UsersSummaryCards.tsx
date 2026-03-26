import { Users2, CheckCircle2, MinusCircle, ShieldCheck } from "lucide-react";

import type { UserSummaryMetrics } from "@/features/users/types/user";
import { Card } from "@/shared/components/ui/Card";

export function UsersSummaryCards({
  isLoading,
  summary,
}: {
  isLoading: boolean;
  summary: UserSummaryMetrics;
}) {
  const cards = [
    {
      description: "Total users in the system.",
      icon: Users2,
      label: "Total users",
      value: summary.totalUsers,
    },
    {
      description: "Accounts currently active and enabled.",
      icon: CheckCircle2,
      label: "Active users",
      value: summary.activeUsers,
    },
    {
      description: "Accounts that have been deactivated.",
      icon: MinusCircle,
      label: "Inactive users",
      value: summary.inactiveUsers,
    },
    {
      description: "Privileged staff accounts with elevated application access.",
      icon: ShieldCheck,
      label: "Admin users",
      value: summary.staffUsers,
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
