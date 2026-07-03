import type { ApiKey } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class ApiKeyRepository {
  async list(params?: Record<string, string>): Promise<ApiKey[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<ApiKey[]>(`/admin/api-keys${query}`);
  }

  async create(data: { idAgencia: number; token: string; fechaExpiracion: string }): Promise<ApiKey> {
    return request<ApiKey>('/admin/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await fetch(`${API}/admin/api-keys/${id}`, { method: 'DELETE' });
  }
}

export const apiKeyRepository = new ApiKeyRepository();
