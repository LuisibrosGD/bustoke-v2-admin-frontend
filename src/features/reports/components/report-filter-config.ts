import type { ReportQuery } from '../domain';
import type { ComboboxOption } from '@/types/common.types';

export type ReportFilterKey = Exclude<
  keyof ReportQuery,
  'from' | 'to' | 'page' | 'limit'
>;

export type ReportFilterDefinition = {
  key: ReportFilterKey;
  label: string;
  options?: ComboboxOption[];
  placeholder: string;
};

export const REPORT_FILTERS: Record<ReportFilterKey, ReportFilterDefinition> = {
  agenciaId: {
    key: 'agenciaId',
    label: 'Agencia',
    placeholder: 'Selecciona una agencia',
    options: [],
  },
  rutaId: {
    key: 'rutaId',
    label: 'Ruta',
    placeholder: 'Selecciona una ruta',
    options: [],
  },
  busId: {
    key: 'busId',
    label: 'Bus',
    placeholder: 'Selecciona un bus',
    options: [],
  },
  viajeId: {
    key: 'viajeId',
    label: 'Viaje',
    placeholder: 'Selecciona un viaje',
    options: [],
  },
  estadoViaje: {
    key: 'estadoViaje',
    label: 'Estado del viaje',
    placeholder: 'Selecciona un estado',
    options: [
      { value: 'programado', label: 'Programado' },
      { value: 'en_curso', label: 'En curso' },
      { value: 'finalizado', label: 'Finalizado' },
      { value: 'cancelado', label: 'Cancelado' },
    ],
  },
  estadoPago: {
    key: 'estadoPago',
    label: 'Estado del pago',
    placeholder: 'Selecciona un estado',
    options: [
      { value: 'pendiente', label: 'Pendiente' },
      { value: 'completado', label: 'Completado' },
      { value: 'fallido', label: 'Fallido' },
      { value: 'reembolsado', label: 'Reembolsado' },
    ],
  },
  metodoPago: {
    key: 'metodoPago',
    label: 'Método de pago',
    placeholder: 'Selecciona un método',
    options: [
      { value: 'yape', label: 'Yape' },
      { value: 'plin', label: 'Plin' },
      { value: 'tarjeta', label: 'Tarjeta' },
    ],
  },
  canalVenta: {
    key: 'canalVenta',
    label: 'Canal de venta',
    placeholder: 'Selecciona un canal',
    options: [
      { value: 'app_bustoke', label: 'App Bustoke' },
      { value: 'ventanilla_fisica', label: 'Ventanilla física' },
    ],
  },
};

export const REPORT_FILTER_KEYS_BY_SLUG: Record<string, ReportFilterKey[]> = {
  ventas: ['agenciaId', 'rutaId', 'estadoPago', 'metodoPago', 'canalVenta'],
  viajes: ['agenciaId', 'rutaId', 'busId', 'estadoViaje'],
  'manifiesto-sutran': ['agenciaId', 'rutaId', 'viajeId'],
  financiero: ['agenciaId'],
};