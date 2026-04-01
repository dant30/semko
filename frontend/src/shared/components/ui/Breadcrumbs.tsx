import * as React from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ className, items, separator = '/', ...props }, ref) => {
    return (
      <nav ref={ref} className={cn('flex items-center space-x-2 text-sm text-text-muted', className)} {...props}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-text-muted">{separator}</span>}
            {item.to ? (
              <Link to={item.to} className="hover:text-accent-600 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-text-primary">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }
);
Breadcrumbs.displayName = 'Breadcrumbs';