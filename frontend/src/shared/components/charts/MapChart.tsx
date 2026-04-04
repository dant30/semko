// frontend/src/shared/components/charts/MapChart.tsx
import { cn } from '@/shared/utils/classnames';

interface MapChartPoint {
  x?: number;
  y?: number;
  label?: string | number;
  intensity?: number;
}

const DEFAULT_POINTS: MapChartPoint[] = [
  { x: 24, y: 48, label: "A", intensity: 0.2 },
  { x: 42, y: 30, label: "B", intensity: 0.45 },
  { x: 57, y: 44, label: "C", intensity: 0.7 },
  { x: 72, y: 26, label: "D", intensity: 0.9 },
];

function intensityColor(intensity: number): string {
  if (intensity >= 0.8) return "var(--chart-danger)";
  if (intensity >= 0.6) return "var(--chart-warning)";
  if (intensity >= 0.35) return "var(--chart-primary)";
  return "var(--chart-success)";
}

interface MapChartProps {
  points?: MapChartPoint[];
  title?: string;
  className?: string;
}

export default function MapChart({
  points = DEFAULT_POINTS,
  title = "Map Heat Layer",
  className = "",
}: MapChartProps) {
  const normalizedPoints = points.map((point, index) => ({
    x: Number(point?.x ?? 0),
    y: Number(point?.y ?? 0),
    label: String(point?.label ?? `P${index + 1}`),
    intensity: Math.max(0, Math.min(1, Number(point?.intensity ?? 0))),
  }));
  const summary = `${title}. ${normalizedPoints.length} plotted points with low to critical intensity levels.`;
  return (
    <section className={cn('ui-chart-shell', className)}>
      <header className="mb-3 flex items-center justify-between">
        <h3 className="ui-chart-title">{title}</h3>
        <span className="ui-chart-meta">{normalizedPoints.length} points</span>
      </header>
      <p className="sr-only">{summary}</p>
      <svg
        viewBox="0 0 100 60"
        className="h-auto w-full rounded-lg"
        style={{ backgroundColor: 'var(--surface-subtle)' }}
        role="img"
        aria-label={`${title} heat map`}
      >
        <rect x="0" y="0" width="100" height="60" fill="var(--surface-subtle)" />
        <path d="M8 50 L20 42 L36 48 L54 38 L68 44 L90 30" fill="none" stroke="var(--chart-grid)" strokeWidth="1.3" opacity="0.5" />
        <path d="M10 18 L22 24 L34 16 L48 20 L64 12 L82 18" fill="none" stroke="var(--chart-grid)" strokeWidth="1.1" opacity="0.3" />
        {normalizedPoints.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle cx={point.x} cy={point.y} r={2.1 + point.intensity * 2.4} fill={intensityColor(point.intensity)} opacity="0.85" />
            <circle cx={point.x} cy={point.y} r="1.2" fill="var(--surface-panel)" />
            <title>{`${point.label} (${Math.round(point.intensity * 100)}%)`}</title>
          </g>
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-text-secondary" aria-label="Heat levels legend">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--chart-success)' }} />Low</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--chart-primary)' }} />Medium</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--chart-warning)' }} />High</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--chart-danger)' }} />Critical</span>
      </div>
    </section>
  );
}
