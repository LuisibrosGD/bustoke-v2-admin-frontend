import { ReportQuery } from '../domain';
import { PATHS } from '@/lib/constants/paths';

export type PageSearchParams = {
  [key: string]: string | string[] | undefined;
};

export const REPORT_QUERY_KEYS: Array<keyof ReportQuery> = [
  'from',
  'to',
  'page',
  'limit',
  'agenciaId',
  'rutaId',
  'busId',
  'viajeId',
  'estadoViaje',
  'estadoPago',
  'metodoPago',
  'canalVenta',
];

function getParamValue(
  searchParams: PageSearchParams,
  key: keyof ReportQuery
): string | undefined {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parseReportQuery(searchParams: PageSearchParams): ReportQuery {
  const query = REPORT_QUERY_KEYS.reduce<ReportQuery>((acc, key) => {
    const value = getParamValue(searchParams, key);

    if (value) {
      acc[key] = value;
    }

    return acc;
  }, {});

  return {
    ...query,
    page: query.page ?? '1',
    limit: query.limit ?? '30',
  };
}

export function buildReportHref(
  slug: string,
  query: ReportQuery,
  updates: ReportQuery = {},
  omit: Array<keyof ReportQuery> = []
): string {
  const params = new URLSearchParams();
  const nextQuery = { ...query, ...updates };

  REPORT_QUERY_KEYS.forEach((key) => {
    if (omit.includes(key)) return;

    const value = nextQuery[key];

    if (value) {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();

  return `${PATHS.reportDetailPage(slug)}${queryString ? `?${queryString}` : ''}`;
}

export function buildExportHref(slug: string, query: ReportQuery): string {
  const href = buildReportHref(slug, query, {}, ['page', 'limit']);
  const [, queryString] = href.split('?');

  return `/api/reports/${slug}/export${queryString ? `?${queryString}` : ''}`;
}