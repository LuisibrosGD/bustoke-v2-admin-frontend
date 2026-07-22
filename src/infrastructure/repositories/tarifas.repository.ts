import type { TarifaRuta } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

export class TarifaRepository {
  async listByRuta(rutaId: string): Promise<TarifaRuta[]> {
    return request<TarifaRuta[]>(`/admin/rutas/${rutaId}/tarifas`);
  }

  async create(data: { idRuta: number; tipoServicio: string; precio: number }): Promise<TarifaRuta> {
    return request<TarifaRuta>('/admin/rutas/tarifas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: { tipoServicio?: string; precio?: number }): Promise<TarifaRuta> {
    return request<TarifaRuta>(`/admin/rutas/tarifas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await request<void>(`/admin/rutas/tarifas/${id}`, { method: 'DELETE' });
  }
}

export const tarifaRepository = new TarifaRepository();
