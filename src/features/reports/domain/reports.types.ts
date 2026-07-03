import { ReportDefinition } from './reports.constants';

export type ReportCell = string | number | boolean | null;

export type ReportRow = ReportCell[];

export type ReportQuery = {
  from?: string;
  to?: string;
  page?: string;
  limit?: string;
  agenciaId?: string;
  rutaId?: string;
  busId?: string;
  viajeId?: string;
  estadoViaje?: string;
  estadoPago?: string;
  metodoPago?: string;
  canalVenta?: string;
};

export type ReportPayload = {
  report: ReportDefinition & {
    fileName?: string;
  };
  rows: ReportRow[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
};
