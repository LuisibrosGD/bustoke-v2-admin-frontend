import type { Boleto } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class BoletoRepository {
  async list(params?: Record<string, string>): Promise<Boleto[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Boleto[]>(`/admin/boletos${query}`);
  }

  async getById(id: string): Promise<Boleto | null> {
    return request<Boleto>(`/admin/boletos/${id}`);
  }

  async getByViaje(viajeId: string): Promise<Boleto[]> {
    return request<Boleto[]>(`/admin/viajes/${viajeId}/boletos`);
  }

  async create(data: Partial<Boleto>): Promise<Boleto> {
    return request<Boleto>('/admin/boletos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: Partial<Boleto>): Promise<Boleto> {
    return request<Boleto>(`/admin/boletos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<boolean> {
    await request<void>(`/admin/boletos/${id}`, { method: 'DELETE' });
    return true;
  }

  async checkIn(id: string, estadoCheckin: string): Promise<Boleto> {
    return request<Boleto>(`/admin/viajes/boletos/${id}/check-in`, {
      method: 'PUT',
      body: JSON.stringify({ estadoCheckin }),
    });
  }

  async scanByQr(viajeId: string, codigoQr: string): Promise<Boleto> {
    return request<Boleto>(`/admin/viajes/${viajeId}/check-in/scan`, {
      method: 'POST',
      body: JSON.stringify({ codigoQr }),
    });
  }
}

export const boletoRepository = new BoletoRepository();
