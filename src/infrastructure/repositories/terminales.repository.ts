import type { Terminal } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class TerminalRepository {
  async list(params?: Record<string, string>): Promise<Terminal[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Terminal[]>(`/admin/terminales${query}`);
  }

  async getById(id: string): Promise<Terminal | null> {
    return request<Terminal>(`/admin/terminales/${id}`);
  }

  async findByAgencia(agenciaId: string): Promise<Terminal[]> {
    return request<Terminal[]>(`/admin/terminales?idAgencia=${agenciaId}`);
  }

  async create(data: Partial<Terminal>): Promise<Terminal> {
    return request<Terminal>('/admin/terminales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<Terminal>): Promise<Terminal> {
    return request<Terminal>(`/admin/terminales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<boolean> {
    await request<void>(`/admin/terminales/${id}`, { method: 'DELETE' });
    return true;
  }
}

export const terminalRepository = new TerminalRepository();