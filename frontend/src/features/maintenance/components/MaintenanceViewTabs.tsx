import { NavLink } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import type { MaintenanceView } from "@/features/maintenance/types/maintenance";
import { cn } from "@/shared/utils/classnames";

const tabs: Array<{ label: string; route: string; view: MaintenanceView }> = [
  { label: "Schedules", route: appRoutes.maintenance, view: "schedules" },
  { label: "Mechanics", route: appRoutes.maintenanceMechanics, view: "mechanics" },
  {
    label: "Service records",
    route: appRoutes.maintenanceServiceRecords,
    view: "service-records",
  },
  { label: "Parts used", route: appRoutes.maintenancePartsUsed, view: "parts-used" },
];

export function MaintenanceViewTabs({ activeView }: { activeView: MaintenanceView }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <NavLink
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            activeView === tab.view
              ? "bg-brand-600 text-white shadow-soft"
              : "bg-white/75 text-app-secondary hover:bg-brand-50 hover:text-brand-900 dark:bg-slate-950/65 dark:hover:bg-slate-800 dark:hover:text-brand-100"
          )}
          key={tab.view}
          to={tab.route}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
