import type { Agencia } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class AgenciaRepository {
  async list(params?: Record<string, string>): Promise<Agencia[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Agencia[]>(`/admin/agencias${query}`);
  }

  async getById(id: string): Promise<Agencia | null> {
    return request<Agencia>(`/admin/agencias/${id}`);
  }

  async create(data: Partial<Agencia>): Promise<Agencia> {
    return request<Agencia>('/admin/agencias', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<Agencia>): Promise<Agencia> {
    return request<Agencia>(`/admin/agencias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(id: string, data: Partial<Agencia>): Promise<Agencia> {
    return request<Agencia>(`/admin/agencias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<boolean> {
    await request<void>(`/admin/agencias/${id}`, { method: 'DELETE' });
    return true;
  }
}

export const agenciaRepository = new AgenciaRepository();
