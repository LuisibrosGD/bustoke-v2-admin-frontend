import type { Suscripcion } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

export class SuscripcionRepository {
  async list(params?: Record<string, string>): Promise<Suscripcion[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Suscripcion[]>(`/admin/suscripciones${query}`);
  }

  async getById(id: string): Promise<Suscripcion | null> {
    return request<Suscripcion>(`/admin/suscripciones/${id}`);
  }

  async create(data: Partial<Suscripcion>): Promise<Suscripcion> {
    return request<Suscripcion>('/admin/suscripciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<Suscripcion>): Promise<Suscripcion> {
    return request<Suscripcion>(`/admin/suscripciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<boolean> {
    await request<void>(`/admin/suscripciones/${id}`, { method: 'DELETE' });
    return true;
  }
}

export const suscripcionRepository = new SuscripcionRepository();
