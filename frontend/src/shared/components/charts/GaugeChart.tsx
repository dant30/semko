// frontend/src/shared/components/charts/GaugeChart.tsx
import { cn } from '@/shared/utils/classnames';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface GaugeChartThresholds {
  warning?: number;
  danger?: number;
}

interface GaugeChartProps {
  value?: number;
  min?: number;
  max?: number;
  title?: string;
  unit?: string;
  thresholds?: GaugeChartThresholds;
  className?: string;
}

function getThresholdColor(normalized: number, warningThreshold: number, dangerThreshold: number): string {
  if (normalized >= dangerThreshold) return "var(--chart-danger)";
  if (normalized >= warningThreshold) return "var(--chart-warning)";
  return "var(--chart-success)";
}

export default function GaugeChart({
  value = 0,
  min = 0,
  max = 100,
  title = "Gauge",
  unit = "%",
  thresholds = { warning: 60, danger: 80 },
  className = "",
}: GaugeChartProps) {
  const numericValue = Number(value ?? 0);
  const numericMin = Number(min ?? 0);
  const numericMax = Number(max ?? 100);
  const normalized = clamp(((numericValue - numericMin) / (numericMax - numericMin || 1)) * 100, 0, 100);
  const angle = -90 + (normalized / 100) * 180;
  const warningThreshold = Number(thresholds?.warning ?? 60);
  const dangerThreshold = Number(thresholds?.danger ?? 80);
  const color = getThresholdColor(normalized, warningThreshold, dangerThreshold);

  const radius = 90;
  const circumference = Math.PI * radius;
  const strokeOffset = circumference - (normalized / 100) * circumference;
  const statusLabel =
    normalized >= dangerThreshold ? "Critical" : normalized >= warningThreshold ? "Warning" : "Healthy";

  return (
    <section className={cn('ui-chart-shell', className)}>
      <header className="mb-3 flex items-center justify-between">
        <h3 className="ui-chart-title">{title}</h3>
        <span className="ui-chart-meta">{normalized.toFixed(0)}%</span>
      </header>
      <p className="sr-only">
        {`${title}. Current value ${numericValue}${unit}. Range ${numericMin} to ${numericMax}.`}
      </p>
      <div
        role="meter"
        aria-label={title}
        aria-valuemin={numericMin}
        aria-valuemax={numericMax}
        aria-valuenow={numericValue}
        aria-valuetext={`${numericValue}${unit} - ${statusLabel}`}
      >
      <div className="mx-auto max-w-[260px]">
        <svg
          viewBox="0 0 240 140"
          className="h-auto w-full"
          role="img"
          aria-label={`${title} gauge`}
        >
          <path d="M 20 120 A 100 100 0 0 1 220 120" fill="none" stroke="var(--chart-grid)" strokeWidth="14" />
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
          />
          <g transform={`rotate(${angle}, 120, 120)`}>
            <line x1="120" y1="120" x2="120" y2="36" stroke="var(--chart-text)" strokeWidth="3" strokeLinecap="round" />
          </g>
          <circle cx="120" cy="120" r="6" fill="var(--chart-text)" />
          <text x="120" y="95" textAnchor="middle" fontSize="24" fontWeight="700" fill="var(--chart-text)">
            {numericValue}
          </text>
          <text x="120" y="114" textAnchor="middle" fontSize="12" fill="var(--chart-muted)">
            {unit}
          </text>
        </svg>
      </div>
      </div>
      <div className="mt-2 text-center text-xs text-text-secondary">
        Status: <span className="font-semibold text-text-primary">{statusLabel}</span>
      </div>
    </section>
  );
}
