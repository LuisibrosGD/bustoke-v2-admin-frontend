import type { AgenciaTerminal } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

export class AgenciaTerminalRepository {
  async list(params?: Record<string, string>): Promise<AgenciaTerminal[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<AgenciaTerminal[]>(`/admin/agencias-terminales${query}`);
  }

  async findByAgencia(agenciaId: string): Promise<AgenciaTerminal[]> {
    return this.list({ idAgencia: agenciaId });
  }

  async getById(id: string): Promise<AgenciaTerminal | null> {
    return request<AgenciaTerminal>(`/admin/agencias-terminales/${id}`);
  }

  async create(data: Partial<AgenciaTerminal>): Promise<AgenciaTerminal> {
    return request<AgenciaTerminal>('/admin/agencias-terminales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<boolean> {
    await request<void>(`/admin/agencias-terminales/${id}`, { method: 'DELETE' });
    return true;
  }
}

export const agenciaTerminalRepository = new AgenciaTerminalRepository();
