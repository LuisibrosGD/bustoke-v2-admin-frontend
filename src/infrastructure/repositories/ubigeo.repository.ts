import type { Departamento, Provincia, Distrito } from '@/infrastructure/domain/types';

const API = '/api';

export type TipoDocumentoCatalogo = { id: string; nombre: string };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class UbigeoRepository {
  async getDepartamentos(): Promise<Departamento[]> {
    return request<Departamento[]>('/admin/ubigeo/departamentos');
  }

  async getProvincias(idDepartamento?: string): Promise<Provincia[]> {
    const query = idDepartamento ? `?id_departamento=${idDepartamento}` : '';
    return request<Provincia[]>(`/admin/ubigeo/provincias${query}`);
  }

  async getDistritos(idProvincia?: string): Promise<Distrito[]> {
    const query = idProvincia ? `?id_provincia=${idProvincia}` : '';
    return request<Distrito[]>(`/admin/ubigeo/distritos${query}`);
  }

  async getTiposDocumento(): Promise<TipoDocumentoCatalogo[]> {
    return request<TipoDocumentoCatalogo[]>('/admin/ubigeo/tipos-documento');
  }
}

export const ubigeoRepository = new UbigeoRepository();
