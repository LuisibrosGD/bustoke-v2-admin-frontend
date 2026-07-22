import type { Plan } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

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
    await request<void>(`/admin/planes/${id}`, { method: 'DELETE' });
  }
}

export const planRepository = new PlanRepository();
