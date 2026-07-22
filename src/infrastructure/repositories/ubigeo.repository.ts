import type { Departamento, Provincia, Distrito } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

export type TipoDocumentoCatalogo = { id: string; nombre: string };

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
