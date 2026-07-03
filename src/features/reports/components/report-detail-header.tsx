import { Badge, Button } from '@/components/ui';
import { PATHS } from '@/lib/constants/paths';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { ReportDefinition } from '../domain';
import { ReportExportButton } from './report-export-button';

interface ReportDetailHeaderProps {
  exportHref: string;
  report: ReportDefinition;
  title: string;
}

export function ReportDetailHeader({
  exportHref,
  report,
  title,
}: ReportDetailHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <Button asChild variant="ghost" className="-ml-3 mb-3">
          <Link href={PATHS.reportsPage}>
            <ArrowLeftIcon className="size-4" />
            Reportes
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{report.code}</Badge>
          <span className="text-sm text-muted-foreground">
            Fila {report.sourceRow} del archivo
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
      </div>
      <ReportExportButton
        exportHref={exportHref}
        fallbackFileName={`${report.slug}.xlsx`}
      />
    </div>
  );
}
