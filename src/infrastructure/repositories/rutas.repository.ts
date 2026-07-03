import type { Ruta } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class RutaRepository {
  async list(params?: Record<string, string>): Promise<Ruta[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Ruta[]>(`/admin/rutas${query}`);
  }

  async getById(id: string): Promise<Ruta | null> {
    return request<Ruta>(`/admin/rutas/${id}`);
  }

  async findByAgencia(agenciaId: string): Promise<Ruta[]> {
    return this.list({ id_agencia: agenciaId });
  }

  async create(data: Partial<Ruta>): Promise<Ruta> {
    return request<Ruta>('/admin/rutas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<Ruta>): Promise<Ruta> {
    return request<Ruta>(`/admin/rutas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<boolean> {
    await request<void>(`/admin/rutas/${id}`, { method: 'DELETE' });
    return true;
  }
}

export const rutaRepository = new RutaRepository();
