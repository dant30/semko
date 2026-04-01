import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ className, currentPage, totalPages, onPageChange, siblingCount = 1, ...props }, ref) => {
    const range = (start: number, end: number) => {
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const getPageNumbers = () => {
      const totalNumbers = siblingCount * 2 + 3;
      if (totalPages <= totalNumbers) {
        return range(1, totalPages);
      }
      const leftSibling = Math.max(currentPage - siblingCount, 1);
      const rightSibling = Math.min(currentPage + siblingCount, totalPages);
      const showLeftDots = leftSibling > 2;
      const showRightDots = rightSibling < totalPages - 1;
      if (!showLeftDots && showRightDots) {
        const leftRange = range(1, totalNumbers - 2);
        return [...leftRange, '...', totalPages];
      }
      if (showLeftDots && !showRightDots) {
        const rightRange = range(totalPages - (totalNumbers - 2), totalPages);
        return [1, '...', ...rightRange];
      }
      const middleRange = range(leftSibling, rightSibling);
      return [1, '...', ...middleRange, '...', totalPages];
    };

    return (
      <div ref={ref} className={cn('flex items-center justify-center space-x-2', className)} {...props}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-secondary p-2"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...' || page === currentPage}
            className={cn(
              'btn btn-secondary w-10',
              page === currentPage && 'btn-primary'
            )}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn btn-secondary p-2"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }
);
Pagination.displayName = 'Pagination';