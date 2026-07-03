import type { ManifiestoSutran } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class ManifiestoRepository {
  async list(params?: Record<string, string>): Promise<ManifiestoSutran[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<ManifiestoSutran[]>(`/admin/manifiestos${query}`);
  }
}

export const manifiestoRepository = new ManifiestoRepository();
