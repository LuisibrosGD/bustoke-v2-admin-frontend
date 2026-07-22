import type { Liquidacion } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

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
