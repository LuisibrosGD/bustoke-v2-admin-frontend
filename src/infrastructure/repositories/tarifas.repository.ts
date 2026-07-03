import type { TarifaRuta } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

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
    await fetch(`${API}/admin/rutas/tarifas/${id}`, { method: 'DELETE' });
  }
}

export const tarifaRepository = new TarifaRepository();
