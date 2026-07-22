import type { MensajeReclamo, Reclamo } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

export class ReclamoRepository {
  async list(params?: Record<string, string>): Promise<Reclamo[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Reclamo[]>(`/admin/reclamos${query}`);
  }

  async getById(id: string): Promise<Reclamo | null> {
    return request<Reclamo>(`/admin/reclamos/${id}`);
  }

  async create(data: Partial<Reclamo>): Promise<Reclamo> {
    return request<Reclamo>('/admin/reclamos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<boolean> {
    await request<void>(`/admin/reclamos/${id}`, { method: 'DELETE' });
    return true;
  }

  async update(id: string, data: Partial<Reclamo>): Promise<Reclamo> {
    return request<Reclamo>(`/admin/reclamos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ── Mensajes ───────────────────────────────────────────────────────────────

  async listMensajes(reclamoId: string): Promise<MensajeReclamo[]> {
    return request<MensajeReclamo[]>(`/admin/reclamos/${reclamoId}/mensajes`);
  }

  async createMensaje(reclamoId: string, data: { idUsuario: number; textMensaje: string }): Promise<MensajeReclamo> {
    return request<MensajeReclamo>(`/admin/reclamos/${reclamoId}/mensajes`, {
      method: 'POST',
      body: JSON.stringify({ idReclamo: parseInt(reclamoId), ...data }),
    });
  }
}

export const reclamoRepository = new ReclamoRepository();
