import type { Asiento, TipoServicio } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class AsientoRepository {
  async listByBus(busId: string): Promise<Asiento[]> {
    return request<Asiento[]>(`/admin/flota/buses/${busId}/asientos`);
  }

  async update(id: string, data: { bloqueadoManual?: boolean; tipoServicio?: TipoServicio }): Promise<Asiento> {
    return request<Asiento>(`/admin/flota/asientos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async create(busId: string, data: Partial<Asiento>): Promise<Asiento> {
    return request<Asiento>('/admin/flota/asientos', {
      method: 'POST',
      body: JSON.stringify({ ...data, idBus: busId }),
    });
  }

  async delete(id: string): Promise<boolean> {
    await request<void>(`/admin/flota/asientos/${id}`, { method: 'DELETE' });
    return true;
  }

  async replaceTemplate(busId: string, asientos: Partial<Asiento>[]): Promise<Asiento[]> {
    const existentes = await this.listByBus(busId);
    await Promise.all(existentes.map((a) => this.delete(a.id)));
    return Promise.all(asientos.map((a) => this.create(busId, a)));
  }
}

export const asientoRepository = new AsientoRepository();
