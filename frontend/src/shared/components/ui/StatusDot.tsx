interface StatusDotProps {
  tone?: "default" | "success" | "warning" | "danger";
}

export function StatusDot({ tone = "default" }: StatusDotProps) {
  return <span className={`ui-status-dot ui-status-dot--${tone}`} />;
}
