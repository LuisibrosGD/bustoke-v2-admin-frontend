import type { Agencia } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

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
