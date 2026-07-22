import type { ManifiestoDetalle, ManifiestoSutran } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

export class ManifiestoRepository {
  async list(params?: Record<string, string>): Promise<ManifiestoSutran[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<ManifiestoSutran[]>(`/admin/manifiestos${query}`);
  }

  async getById(id: string): Promise<ManifiestoDetalle> {
    return request<ManifiestoDetalle>(`/admin/manifiestos/${id}`);
  }
}

export const manifiestoRepository = new ManifiestoRepository();
