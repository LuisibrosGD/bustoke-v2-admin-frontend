import { Badge, Button } from '@/components/ui';
import { REPORTS, getReportTitle } from '@/features/reports/domain';
import { PATHS } from '@/lib/constants/paths';
import { ArrowRightIcon, Columns3Icon } from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mt-2 text-3xl font-semibold">Reporte y Analítica</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Reportes generados desde la plataforma Bustoke.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {REPORTS.map((report) => (
          <article
            key={report.slug}
            className="flex min-h-32 flex-col justify-between gap-4 rounded-lg border p-4"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{report.code}</Badge>
                <span className="text-xs text-muted-foreground">
                  Fila {report.sourceRow}
                </span>
              </div>
              <div>
                <h2 className="text-base font-semibold">
                  {getReportTitle(report)}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Columns3Icon className="size-4" />
                  {report.columns.length} columnas
                </p>
              </div>
            </div>

            <Button asChild variant="outline" className="self-start">
              <Link href={PATHS.reportDetailPage(report.slug)}>
                Ver reporte
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </article>
        ))}
      </section>
    </div>
  );
}
