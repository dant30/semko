interface GridStatProps {
  label: string;
  value: string;
}

export function GridStat({ label, value }: GridStatProps) {
  return (
    <div className="ui-grid-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
