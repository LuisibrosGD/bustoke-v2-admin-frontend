import type { Viaje } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

export class ViajeRepository {
  async list(params?: Record<string, string>): Promise<Viaje[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Viaje[]>(`/admin/viajes${query}`);
  }

  async getById(id: string): Promise<Viaje | null> {
    return request<Viaje>(`/admin/viajes/${id}`);
  }

  async findByRuta(rutaId: string): Promise<Viaje[]> {
    return this.list({ idRuta: rutaId });
  }

  async findByAgencia(agenciaId: string): Promise<Viaje[]> {
    return this.list({ idAgencia: agenciaId });
  }

  async create(data: Partial<Viaje>): Promise<Viaje> {
    return request<Viaje>('/admin/viajes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<Viaje>): Promise<Viaje> {
    return request<Viaje>(`/admin/viajes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<boolean> {
    await request<void>(`/admin/viajes/${id}`, { method: 'DELETE' });
    return true;
  }
}

export const viajeRepository = new ViajeRepository();
