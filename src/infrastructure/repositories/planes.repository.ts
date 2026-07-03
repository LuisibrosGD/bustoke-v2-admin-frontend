import type { Plan } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class PlanRepository {
  async list(): Promise<Plan[]> {
    return request<Plan[]>('/admin/planes');
  }

  async getById(id: string): Promise<Plan | null> {
    return request<Plan>(`/admin/planes/${id}`);
  }

  async create(data: { nombre: string; precio: number; limiteBuses: number }): Promise<Plan> {
    return request<Plan>('/admin/planes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<Plan>): Promise<Plan> {
    return request<Plan>(`/admin/planes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await fetch(`${API}/admin/planes/${id}`, { method: 'DELETE' });
  }
}

export const planRepository = new PlanRepository();
