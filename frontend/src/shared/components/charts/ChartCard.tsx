// frontend/src/shared/components/charts/ChartCard.tsx
import { ReactNode } from 'react';
import { cn } from '@/shared/utils/classnames';

interface ChartCardProps {
  title?: string;
  meta?: string | number;
  children: ReactNode;
  className?: string;
}

/**
 * A wrapper component for chart content.
 * Use this to wrap chart components for consistent styling and layout.
 * 
 * @example
 * <ChartCard title="Sales" meta="5 products">
 *   <BarChart data={data} />
 * </ChartCard>
 */
export function ChartCard({ title, meta, children, className }: ChartCardProps) {
  return (
    <div className={cn('ui-chart-shell', className)}>
      {(title || meta) && (
        <header className="mb-3 flex items-center justify-between">
          {title && <h3 className="ui-chart-title">{title}</h3>}
          {meta && <span className="ui-chart-meta">{meta}</span>}
        </header>
      )}
      {children}
    </div>
  );
}
