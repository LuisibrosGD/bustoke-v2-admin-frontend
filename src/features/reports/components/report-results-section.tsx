import { ReportPayload, ReportQuery } from '../domain';
import { ReportPagination } from './report-pagination';
import { ReportResultsTable } from './report-results-table';

interface ReportResultsSectionProps {
  data: ReportPayload;
  query: ReportQuery;
  slug: string;
}

export function ReportResultsSection({
  data,
  query,
  slug,
}: ReportResultsSectionProps) {
  return (
    <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="flex flex-col gap-2 border-b px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-base font-semibold">Resultados</h2>
        <p className="text-sm text-muted-foreground">
          {data.rows.length} de {data.meta.totalItems} filas filtradas. El Excel
          incluye el total filtrado.
        </p>
      </div>
      <ReportResultsTable data={data} />
      <ReportPagination data={data} query={query} slug={slug} />
    </section>
  );
}
