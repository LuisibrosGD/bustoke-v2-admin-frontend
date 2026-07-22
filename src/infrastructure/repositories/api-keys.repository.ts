import type { ApiKey } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

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
    await request<void>(`/admin/api-keys/${id}`, { method: 'DELETE' });
  }
}

export const apiKeyRepository = new ApiKeyRepository();
