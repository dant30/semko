import { AlertTriangle, ArrowDownUp, Boxes, ClipboardList, Filter, PackagePlus, Warehouse } from "lucide-react";

import type { StoreSummaryMetrics } from "@/features/stores/types/store";
import { formatNumber } from "@/shared/utils/number";
import { Card, Skeleton } from "@/shared/components/ui";

interface StoresSummaryCardsProps {
  isLoading?: boolean;
  summary: StoreSummaryMetrics;
}

const cardConfig = [
  { icon: Boxes, key: "activeItems", label: "Active items" },
  { icon: Warehouse, key: "totalStockOnHand", label: "Stock on hand" },
  { icon: AlertTriangle, key: "belowReorder", label: "Below reorder" },
  { icon: PackagePlus, key: "totalReceivings", label: "Received quantity" },
  { icon: ClipboardList, key: "pendingRequisitions", label: "Open requisitions" },
  { icon: ArrowDownUp, key: "totalIssues", label: "Issued quantity" },
  { icon: Filter, key: "pendingPurchaseOrders", label: "Open purchase orders" },
] as const;

export function StoresSummaryCards({
  isLoading = false,
  summary,
}: StoresSummaryCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        const value = summary[card.key];
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
                    {formatNumber(value, {
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
