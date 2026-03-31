import { Card } from "@/shared/components/ui/Card";
import type { NotificationSummary } from "@/features/notifications/types/notification";

interface NotificationsSummaryCardsProps {
  summary: NotificationSummary | null;
  isLoading: boolean;
}

export function NotificationsSummaryCards({ summary, isLoading }: NotificationsSummaryCardsProps) {
  const stats = summary
    ? [
        { label: "Unread", value: summary.total_unread, color: "text-rose-600" },
        { label: "Read", value: summary.total_read, color: "text-slate-700" },
        { label: "Archived", value: summary.total_archived, color: "text-app-muted" },
        { label: "Recent", value: summary.recent_count, color: "text-amber-600" },
      ]
    : [];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {isLoading
        ? Array.from({ length: 3 }).map((_, idx) => (
            <Card className="h-28 animate-pulse rounded-3xl" key={idx}>
              <div className="h-full" />
            </Card>
          ))
        : stats.map((stat) => (
            <Card className="rounded-3xl p-4" key={stat.label}>
              <p className="text-xs uppercase tracking-wider text-app-muted">{stat.label}</p>
              <p className={`mt-2 text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
    </div>
  );
}
