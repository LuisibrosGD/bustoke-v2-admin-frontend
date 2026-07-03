import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { ReportPayload, ReportQuery } from '../domain';
import { buildReportHref } from './report-query.utils';

interface ReportPaginationProps {
  data: ReportPayload;
  query: ReportQuery;
  slug: string;
}

export function ReportPagination({ data, query, slug }: ReportPaginationProps) {
  const { meta } = data;

  return (
    <div className="flex flex-col gap-3 border-t p-4 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-sm text-muted-foreground">
        Página {meta.page} de {meta.totalPages}
      </p>
      <Pagination className="mx-0 justify-start lg:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={buildReportHref(slug, query, {
                page: String(Math.max(1, meta.page - 1)),
              })}
              aria-disabled={!meta.hasPrevPage}
              className={cn(
                !meta.hasPrevPage && 'pointer-events-none opacity-50'
              )}
            />
          </PaginationItem>
          {Array.from({ length: meta.totalPages }, (_, index) => index + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === meta.totalPages ||
                Math.abs(page - meta.page) <= 1
            )
            .map((page, index, pages) => (
              <PaginationItem key={page}>
                {index > 0 && page - pages[index - 1] > 1 ? (
                  <span className="px-2 text-muted-foreground">...</span>
                ) : null}
                <PaginationLink
                  href={buildReportHref(slug, query, {
                    page: String(page),
                  })}
                  isActive={page === meta.page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
          <PaginationItem>
            <PaginationNext
              href={buildReportHref(slug, query, {
                page: String(Math.min(meta.totalPages, meta.page + 1)),
              })}
              aria-disabled={!meta.hasNextPage}
              className={cn(
                !meta.hasNextPage && 'pointer-events-none opacity-50'
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
