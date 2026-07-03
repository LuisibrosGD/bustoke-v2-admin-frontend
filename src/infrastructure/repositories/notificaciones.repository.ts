import type { Notificacion } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class NotificacionRepository {
  async list(soloNoLeidas = false): Promise<Notificacion[]> {
    const q = soloNoLeidas ? '?soloNoLeidas=true' : '';
    return request<Notificacion[]>(`/admin/notificaciones${q}`);
  }

  async contarNoLeidas(): Promise<{ total: number }> {
    return request<{ total: number }>('/admin/notificaciones/contar');
  }

  async marcarLeida(id: string): Promise<Notificacion> {
    return request<Notificacion>(`/admin/notificaciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ leida: true }),
    });
  }

  async marcarTodasLeidas(): Promise<{ marcadas: number }> {
    return request<{ marcadas: number }>('/admin/notificaciones/leer-todas', {
      method: 'PUT',
    });
  }
}

export const notificacionRepository = new NotificacionRepository();
