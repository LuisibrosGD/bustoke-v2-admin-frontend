import { Fragment } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui';
import { cn } from '@/lib/utils';

interface DataTablePaginationProps {
  pageIndex: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({
  pageIndex,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
}: DataTablePaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const visiblePages = pages.filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      (page >= pageIndex - 1 && page <= pageIndex + 3)
  );

  return (
    <Pagination className="border-t py-3">
      <PaginationContent className="hidden lg:flex">
        <PaginationItem>
          <PaginationPrevious
            onClick={(e) => {
              e.preventDefault();
              if (hasPrevPage) onPageChange(pageIndex);
            }}
            aria-disabled={!hasPrevPage}
            className={cn(
              'border',
              !hasPrevPage && 'pointer-events-none opacity-50'
            )}
          />
        </PaginationItem>

        {visiblePages.map((page, index) => {
          const isEllipsis = index > 0 && page - visiblePages[index - 1] > 1;
          const isACtive = page === pageIndex + 1;
          return (
            <Fragment key={page}>
              {isEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  isActive={isACtive}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                  className={cn(
                    'border-none shadow-none text-primary-600',
                    isACtive && 'bg-primary-50'
                  )}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            </Fragment>
          );
        })}

        <PaginationItem>
          <PaginationNext
            onClick={(e) => {
              e.preventDefault();
              if (hasNextPage) onPageChange(pageIndex + 2);
            }}
            aria-disabled={!hasNextPage}
            className={cn(
              'border',
              !hasNextPage && 'pointer-events-none opacity-50'
            )}
          />
        </PaginationItem>
      </PaginationContent>

      <PaginationContent className="flex lg:hidden w-full items-center justify-between px-4">
        <PaginationItem>
          <PaginationPrevious
            onClick={(e) => {
              e.preventDefault();
              if (hasPrevPage) onPageChange(pageIndex);
            }}
            aria-disabled={!hasPrevPage}
            className={cn(
              'border',
              !hasPrevPage && 'pointer-events-none opacity-50'
            )}
          />
        </PaginationItem>

        <p className="text-sm font-medium text-muted-foreground">
          Página {pageIndex + 1} de {totalPages}
        </p>

        <PaginationItem>
          <PaginationNext
            onClick={(e) => {
              e.preventDefault();
              if (hasNextPage) onPageChange(pageIndex + 2);
            }}
            aria-disabled={!hasNextPage}
            className={cn(
              'border',
              !hasNextPage && 'pointer-events-none opacity-50'
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
