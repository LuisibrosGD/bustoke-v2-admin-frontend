import type { TicketSoporte } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class SoporteRepository {
  async list(params?: Record<string, string>): Promise<TicketSoporte[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<TicketSoporte[]>(`/admin/soporte${query}`);
  }

  async getById(id: string): Promise<TicketSoporte | null> {
    return request<TicketSoporte>(`/admin/soporte/${id}`);
  }

  async create(data: Partial<TicketSoporte>): Promise<TicketSoporte> {
    return request<TicketSoporte>('/admin/soporte', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<TicketSoporte>): Promise<TicketSoporte> {
    return request<TicketSoporte>(`/admin/soporte/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<boolean> {
    await fetch(`${API}/admin/soporte/${id}`, { method: 'DELETE' });
    return true;
  }
}

export const soporteRepository = new SoporteRepository();
