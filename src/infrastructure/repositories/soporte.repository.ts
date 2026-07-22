import type { TicketSoporte } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

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
    await request<void>(`/admin/soporte/${id}`, { method: 'DELETE' });
    return true;
  }
}

export const soporteRepository = new SoporteRepository();
