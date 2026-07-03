import type { Suscripcion } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

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
    await fetch(`${API}/admin/suscripciones/${id}`, { method: 'DELETE' });
    return true;
  }
}

export const suscripcionRepository = new SuscripcionRepository();
