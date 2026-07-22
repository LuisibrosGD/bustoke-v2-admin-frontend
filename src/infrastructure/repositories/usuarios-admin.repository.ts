import type { Usuario } from '@/infrastructure/domain/types';
import { request } from '@/lib/http/api-request';

export type UsuarioCreateInput = {
  email: string;
  telefono?: string | null;
  rol: 'superadmin' | 'admin_agencia' | 'admin_terminal';
  idAgencia?: string | null;
  idTerminal?: string | null;
};

export type UsuarioCreated = Usuario & { passwordTemporal: string };

export class UsuarioAdminRepository {
  async list(params?: Record<string, string>): Promise<Usuario[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Usuario[]>(`/admin/usuarios${query}`);
  }

  async create(data: UsuarioCreateInput): Promise<UsuarioCreated> {
    return request<UsuarioCreated>('/admin/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: { telefono?: string; activo?: boolean; idTerminal?: string }): Promise<Usuario> {
    return request<Usuario>(`/admin/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deactivate(id: string): Promise<void> {
    await request<void>(`/admin/usuarios/${id}`, { method: 'DELETE' });
  }
}

export const usuarioAdminRepository = new UsuarioAdminRepository();
