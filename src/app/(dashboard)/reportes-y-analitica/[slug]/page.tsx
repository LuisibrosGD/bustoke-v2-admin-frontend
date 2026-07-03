import {
  PageSearchParams,
  ReportDetailHeader,
  ReportFilters,
  ReportResultsSection,
  buildExportHref,
  parseReportQuery,
} from '@/features/reports/components';
import {
  REPORTS,
  getReportBySlug,
  getReportTitle,
} from '@/features/reports/domain';
import { getReportAction } from '@/features/reports/infrastructure/reports.actions';
import { authOptions } from '@/features/auth';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<PageSearchParams>;
}

export function generateStaticParams() {
  return REPORTS.map((report) => ({ slug: report.slug }));
}

export default async function ReportDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const report = getReportBySlug(slug);

  if (!report) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const accessToken = session?.user?.accessToken;
  let role: string | undefined;
  let userAgenciaId: string | undefined;
  if (accessToken) {
    try {
      const payload = jwtDecode<{ rol?: string; id_agencia?: number | string | null }>(accessToken);
      role = payload.rol;
      userAgenciaId = payload.id_agencia != null ? String(payload.id_agencia) : undefined;
    } catch { /* ignore */ }
  }
  const isSuperAdmin = role === 'superadmin';

  const query = parseReportQuery(resolvedSearchParams);
  const data = await getReportAction(slug, query);
  const title = getReportTitle(report);

  return (
    <div className="space-y-6">
      <ReportDetailHeader
        exportHref={buildExportHref(slug, query)}
        report={report}
        title={title}
      />
      <ReportFilters
        query={query}
        slug={slug}
        isSuperAdmin={isSuperAdmin}
        userAgenciaId={userAgenciaId}
      />
      <ReportResultsSection data={data} query={query} slug={slug} />
    </div>
  );
}
