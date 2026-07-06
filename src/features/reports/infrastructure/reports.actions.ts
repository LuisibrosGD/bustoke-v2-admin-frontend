import { serverHttpClient } from '@/lib/http/server-http-client';
import { reportEndpoints } from './reports.endpoints';
import { getReportBySlug } from '../domain';
import type { ReportPayload, ReportQuery, ReportRow, ReportCell } from '../domain/reports.types';

interface BackendReportResponse {
  slug: string;
  data: Record<string, unknown>[];
  total: number;
}

const COLUMN_TO_KEY: Record<string, Record<string, string>> = {
  ventas: {
    AGENCIA: 'agencia',
    RUTA: 'ruta',
    'FECHA VIAJE': 'fechaViaje',
    PASAJEROS: 'totalBoletos',
    'MONTO TOTAL': 'totalVentas',
    COMISIÓN: 'comision',
  },
  viajes: {
    FECHA: 'fechaSalida',
    RUTA: 'ruta',
    BUS: 'bus',
    PASAJEROS: 'totalBoletos',
    ESTADO: 'estado',
  },
  'manifiesto-sutran': {
    'N° DOCUMENTO': 'numeroDocumento',
    NOMBRES: 'pasajero',
    APELLIDOS: 'pasajero',
    ASIENTO: 'asiento',
    ORIGEN: 'origen',
    DESTINO: 'destino',
  },
  financiero: {
    AGENCIA: 'agencia',
    PERIODO: 'periodo',
    'TOTAL VENTAS': 'totalVentas',
    COMISIÓN: 'comision',
    'NETO TRANSFERIR': 'netoTransferir',
    BOLETOS: 'totalBoletos',
  },
};

export async function getReportAction(slug: string, query: ReportQuery): Promise<ReportPayload> {
  const params: Record<string, string> = {};
  if (query.agenciaId) params.id_agencia = query.agenciaId;
  if (query.rutaId) params.id_ruta = query.rutaId;
  if (query.estadoPago) params.estado_pago = query.estadoPago;
  if (query.metodoPago) params.metodo_pago = query.metodoPago;
  if (query.canalVenta) params.canal_venta = query.canalVenta;
  if (query.busId) params.id_bus = query.busId;
  if (query.viajeId) params.id_viaje = query.viajeId;
  if (query.estadoViaje) params.estado_viaje = query.estadoViaje;
  if (query.from) params.fecha_inicio = query.from;
  if (query.to) params.fecha_fin = query.to;

  const response = await serverHttpClient.get<BackendReportResponse>(reportEndpoints.list(slug), {
    params,
  });

  const { data: rawData, total } = response.data;
  const reportDef = getReportBySlug(slug);
  const keyMap = COLUMN_TO_KEY[slug] ?? {};
  const columns = reportDef?.columns ?? [];
  const code = reportDef?.code ?? slug.toUpperCase();
  const title = reportDef?.title ?? code;

  const rows = rawData.map((item) => {
    if (!reportDef) return Object.values(item) as ReportRow;
    return columns.map((column) => {
      const key = keyMap[column];
      return key ? ((item[key] ?? null) as ReportCell) : null;
    }) as ReportRow;
  });

  return {
    report: {
      slug,
      code,
      title,
      columns,
      sourceRow: reportDef?.sourceRow ?? 1,
      parameters: reportDef?.parameters ?? [],
      fileName: `${slug}.xlsx`,
    },
    rows,
    meta: {
      page: 1,
      limit: total || 30,
      totalItems: total,
      totalPages: 1,
      hasPrevPage: false,
      hasNextPage: false,
    },
  };
}
