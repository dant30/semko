import { NavLink } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import type { VehicleView } from "@/features/vehicles/types/vehicle";
import { cn } from "@/shared/utils/classnames";

const tabs: Array<{ label: string; path: string; view: VehicleView }> = [
  { label: "Fleet register", path: appRoutes.vehicles, view: "fleet" },
  { label: "Vehicle types", path: appRoutes.vehicleTypes, view: "types" },
  { label: "Ownerships", path: appRoutes.vehicleOwnerships, view: "ownerships" },
];

export function VehiclesViewTabs({ activeView }: { activeView: VehicleView }) {
  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((tab) => (
        <NavLink
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
            activeView === tab.view
              ? "border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-100"
              : "border-surface-border bg-white/70 text-app-secondary hover:bg-white dark:bg-slate-900/70 dark:hover:bg-slate-900"
          )}
          key={tab.path}
          to={tab.path}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
