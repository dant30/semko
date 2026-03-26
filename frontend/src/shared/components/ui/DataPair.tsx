interface DataPairProps {
  label: string;
  value: string;
}

export function DataPair({ label, value }: DataPairProps) {
  return (
    <div className="ui-data-pair">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
