import type { Liquidacion } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class LiquidacionRepository {
  async list(params?: Record<string, string>): Promise<Liquidacion[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Liquidacion[]>(`/admin/liquidaciones${query}`);
  }

  async update(id: string, data: Partial<Liquidacion>): Promise<Liquidacion> {
    return request<Liquidacion>(`/admin/liquidaciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const liquidacionRepository = new LiquidacionRepository();
