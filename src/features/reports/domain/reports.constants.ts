export type ReportDefinition = {
  slug: string;
  code: string;
  title: string;
  sourceRow: number;
  parameters: string[];
  columns: string[];
  fixedRows?: string[];
};

export const REPORTS: ReportDefinition[] = [
  {
    slug: 'ventas',
    code: 'REPORTE VENTAS',
    title: 'REPORTE DE VENTAS',
    sourceRow: 1,
    parameters: ['PERIODO', 'DE', 'HASTA'],
    columns: [
      'AGENCIA',
      'RUTA',
      'FECHA VIAJE',
      'PASAJEROS',
      'MONTO TOTAL',
      'COMISIÓN',
    ],
  },
  {
    slug: 'viajes',
    code: 'REPORTE VIAJES',
    title: 'REPORTE DE VIAJES',
    sourceRow: 1,
    parameters: ['PERIODO', 'DE', 'HASTA'],
    columns: [
      'FECHA',
      'RUTA',
      'BUS',
      'PASAJEROS',
      'ESTADO',
    ],
  },
  {
    slug: 'manifiesto-sutran',
    code: 'MANIFIESTO SUTRAN',
    title: 'MANIFIESTO DE PASAJEROS SUTRAN',
    sourceRow: 1,
    parameters: ['FECHA', 'VIAJE'],
    columns: [
      'N° DOCUMENTO',
      'NOMBRES',
      'APELLIDOS',
      'ASIENTO',
      'ORIGEN',
      'DESTINO',
    ],
  },
  {
    slug: 'financiero',
    code: 'REPORTE FINANCIERO',
    title: 'REPORTE FINANCIERO',
    sourceRow: 1,
    parameters: ['PERIODO', 'DE', 'HASTA'],
    columns: [
      'AGENCIA',
      'PERIODO',
      'TOTAL VENTAS',
      'COMISIÓN',
      'NETO TRANSFERIR',
      'BOLETOS',
    ],
  },
];

export function getReportTitle(report: ReportDefinition): string {
  return report.title || report.code;
}

export function getReportBySlug(slug: string): ReportDefinition | undefined {
  return REPORTS.find((report) => report.slug === slug);
}
