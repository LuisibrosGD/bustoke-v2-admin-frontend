import type { Agencia, Bus, Ruta, Viaje } from '@/infrastructure/domain/types';

const API_PREFIX = '/api';

async function get<T>(path: string, token?: string, params?: Record<string, string>): Promise<T> {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_PREFIX}${path}${query}`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body && typeof body === 'object' && typeof (body as { detail?: unknown }).detail === 'string'
      ? (body as { detail: string }).detail
      : null;
    throw new Error(detail ?? `API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  agencias: {
    list: (token?: string, params?: Record<string, string>) =>
      get<Agencia[]>('/admin/agencias', token, params),
    byId: (id: string, token?: string) =>
      get<Agencia>(`/admin/agencias/${id}`, token),
  },
  flota: {
    list: (token?: string, params?: Record<string, string>) =>
      get<Bus[]>('/admin/flota/buses', token, params),
  },
  rutas: {
    list: (token?: string, params?: Record<string, string>) =>
      get<Ruta[]>('/admin/rutas', token, params),
  },
  viajes: {
    list: (token?: string, params?: Record<string, string>) =>
      get<Viaje[]>('/admin/viajes', token, params),
  },
};
