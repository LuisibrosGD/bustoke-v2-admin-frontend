import type { Amenidad } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

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
