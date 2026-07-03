import type { Bus } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class BusRepository {
  async list(params?: Record<string, string>): Promise<Bus[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Bus[]>(`/admin/flota/buses${query}`);
  }

  async getById(id: string): Promise<Bus | null> {
    return request<Bus>(`/admin/flota/buses/${id}`);
  }

  async findByAgencia(agenciaId: string): Promise<Bus[]> {
    return this.list({ idAgencia: agenciaId });
  }

  async create(data: Partial<Bus>): Promise<Bus> {
    return request<Bus>('/admin/flota/buses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<Bus>): Promise<Bus> {
    return request<Bus>(`/admin/flota/buses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<boolean> {
    await request<void>(`/admin/flota/buses/${id}`, { method: 'DELETE' });
    return true;
  }
}

export const busRepository = new BusRepository();
