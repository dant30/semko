import { MetricCard } from "@/shared/components/ui/MetricCard";

interface ClientsSummaryCardsProps {
  total: number;
  active: number;
  inactive: number;
  corporate: number;
  individual: number;
}

export function ClientsSummaryCards({ total, active, inactive, corporate, individual }: ClientsSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard title="Total clients" value={total} />
      <MetricCard title="Active clients" value={active} />
      <MetricCard title="Inactive clients" value={inactive} />
      <MetricCard title="Corporate clients" value={corporate} />
      <MetricCard title="Individual clients" value={individual} />
    </div>
  );
}
