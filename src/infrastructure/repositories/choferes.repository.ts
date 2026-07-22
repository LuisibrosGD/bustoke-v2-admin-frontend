import type { Chofer } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

export class ChoferRepository {
  async list(params?: Record<string, string>): Promise<Chofer[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Chofer[]>(`/admin/choferes${query}`);
  }

  async create(data: Partial<Chofer>): Promise<Chofer> {
    return request<Chofer>('/admin/choferes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<Chofer>): Promise<Chofer> {
    return request<Chofer>(`/admin/choferes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await request<void>(`/admin/choferes/${id}`, { method: 'DELETE' });
  }
}

export const choferRepository = new ChoferRepository();
