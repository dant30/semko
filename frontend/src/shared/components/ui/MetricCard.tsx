interface MetricCardProps {
  label: string;
  value: string;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="ui-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
