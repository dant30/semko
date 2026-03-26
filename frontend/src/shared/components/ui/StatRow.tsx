interface StatRowProps {
  label: string;
  value: string;
}

export function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="ui-stat-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
