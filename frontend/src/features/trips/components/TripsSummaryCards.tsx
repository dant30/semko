import { CheckCircle2, CircleDashed, OctagonX, ReceiptText } from "lucide-react";

import type { TripsOperationsSummary } from "@/features/trips/types/trip";
import { Card, Skeleton } from "@/shared/components/ui";

interface TripsSummaryCardsProps {
  isLoading?: boolean;
  summary: TripsOperationsSummary;
}

const cards = [
  {
    key: "total_trips",
    label: "Total trips",
    icon: CircleDashed,
  },
  {
    key: "delivered_trips",
    label: "Delivered",
    icon: CheckCircle2,
  },
  {
    key: "in_progress_trips",
    label: "In progress",
    icon: ReceiptText,
  },
  {
    key: "cancelled_trips",
    label: "Cancelled",
    icon: OctagonX,
  },
] as const;

export function TripsSummaryCards({
  isLoading = false,
  summary,
}: TripsSummaryCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card className="rounded-3xl p-5" key={card.key}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-app-muted">
                  {card.label}
                </p>
                {isLoading ? (
                  <div className="mt-4 w-24">
                    <Skeleton />
                  </div>
                ) : (
                  <strong className="mt-4 block text-3xl text-app-primary">
                    {summary[card.key]}
                  </strong>
                )}
              </div>
              <div className="rounded-2xl bg-gradient-card p-3 text-brand-700 dark:text-brand-200">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
