import type { Pasajero } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

export class PasajeroRepository {
  async list(params?: Record<string, string>): Promise<Pasajero[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Pasajero[]>(`/admin/pasajeros${query}`);
  }

  async getById(id: string): Promise<Pasajero | null> {
    return request<Pasajero>(`/admin/pasajeros/${id}`);
  }

  async getByViaje(viajeId: string): Promise<Pasajero[]> {
    return request<Pasajero[]>(`/admin/viajes/${viajeId}/pasajeros`);
  }

  async create(data: Partial<Pasajero>): Promise<Pasajero> {
    return request<Pasajero>('/admin/pasajeros', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<Pasajero>): Promise<Pasajero> {
    return request<Pasajero>(`/admin/pasajeros/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<boolean> {
    await request<void>(`/admin/pasajeros/${id}`, { method: 'DELETE' });
    return true;
  }
}

export const pasajeroRepository = new PasajeroRepository();
