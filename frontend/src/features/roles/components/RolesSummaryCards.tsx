import { Users2, ShieldCheck, Lock, Key } from "lucide-react";

import type { RoleRecord } from "@/features/roles/types/role";
import { Card } from "@/shared/components/ui/Card";

export function RolesSummaryCards({
  isLoading,
  roles,
}: {
  isLoading: boolean;
  roles: RoleRecord[];
}) {
  const cards = [
    {
      description: "Total roles configured in the permission layer.",
      icon: Users2,
      label: "Total roles",
      value: roles.length,
    },
    {
      description: "Roles marked as system-level and immutable.",
      icon: ShieldCheck,
      label: "System roles",
      value: roles.filter((role) => role.is_system).length,
    },
    {
      description: "Roles that have one or more permissions assigned.",
      icon: Key,
      label: "Permissioned roles",
      value: roles.filter((role) => role.permissions.length > 0).length,
    },
    {
      description: "Roles with no permissions to help enforce least privilege.",
      icon: Lock,
      label: "No-permission roles",
      value: roles.filter((role) => role.permissions.length === 0).length,
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
