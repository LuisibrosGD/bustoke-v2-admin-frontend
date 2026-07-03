import type { Chofer } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

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
}

export const choferRepository = new ChoferRepository();
