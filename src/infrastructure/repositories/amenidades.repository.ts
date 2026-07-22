import type { Amenidad } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class AmenidadRepository {
  async listByBus(busId: string): Promise<Amenidad[]> {
    return request<Amenidad[]>(`/admin/flota/buses/${busId}/amenidades`);
  }

  /** Reemplaza todas las amenidades del bus por el set dado (borra y recrea en el backend). */
  async replaceForBus(busId: string, amenidades: Partial<Amenidad>[]): Promise<Amenidad[]> {
    return request<Amenidad[]>(`/admin/flota/buses/${busId}/amenidades`, {
      method: 'PUT',
      body: JSON.stringify({
        amenidades: amenidades.map((a) => ({ ...a, idBus: busId })),
      }),
    });
  }
}

export const amenidadRepository = new AmenidadRepository();
