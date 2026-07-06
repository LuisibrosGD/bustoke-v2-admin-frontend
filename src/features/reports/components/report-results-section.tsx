import { ReportPayload, ReportQuery } from '../domain';
import { ReportPagination } from './report-pagination';
import { ReportResultsTable } from './report-results-table';

interface ReportResultsSectionProps {
  data: ReportPayload | null;
  query: ReportQuery;
  slug: string;
}

export function ReportResultsSection({
  data,
  query,
  slug,
}: ReportResultsSectionProps) {
  if (!data) {
    return (
      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-base font-semibold text-muted-foreground">Selecciona filtros</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Usa los filtros de arriba y haz clic en "Aplicar filtros" para ver los resultados.
          </p>
        </div>
      </section>
    );
  }

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
