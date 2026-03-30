import { NavLink } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import type { StoreView } from "@/features/stores/types/store";
import { cn } from "@/shared/utils/classnames";

const tabs: Array<{ label: string; route: string; view: StoreView }> = [
  { label: "Items", route: appRoutes.stores, view: "items" },
  { label: "Receivings", route: appRoutes.storesReceivings, view: "receivings" },
  { label: "Requisitions", route: appRoutes.storesRequisitions, view: "requisitions" },
  { label: "Stock issues", route: appRoutes.storesIssues, view: "issues" },
  { label: "Adjustments", route: appRoutes.storesAdjustments, view: "adjustments" },
  { label: "Purchase orders", route: appRoutes.storesPurchaseOrders, view: "purchase_orders" },
  { label: "Suppliers", route: appRoutes.storesSuppliers, view: "suppliers" },
];

export function StoresViewTabs({ activeView }: { activeView: StoreView }) {
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
