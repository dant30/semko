import { Card } from "@/shared/components/ui/Card";

interface MaterialsSummaryCardsProps {
  summary: {
    total: number;
    active: number;
    inactive: number;
  };
  isLoading: boolean;
}

export function MaterialsSummaryCards({ summary, isLoading }: MaterialsSummaryCardsProps) {
  const cards = [
    { label: "Total materials", value: summary.total, color: "text-brand-600" },
    { label: "Active materials", value: summary.active, color: "text-emerald-600" },
    { label: "Inactive materials", value: summary.inactive, color: "text-rose-600" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {isLoading
        ? Array.from({ length: 3 }).map((_, idx) => (
            <Card className="h-28 animate-pulse rounded-3xl" key={idx}>
              <div className="h-full" />
            </Card>
          ))
        : cards.map((card) => (
            <Card className="rounded-3xl p-5" key={card.label}>
              <p className="text-xs uppercase tracking-wider text-app-muted">{card.label}</p>
              <p className={`mt-3 text-3xl font-bold ${card.color}`}>{card.value}</p>
            </Card>
          ))}
    </div>
  );
}
