import { request } from '@/lib/http/api-request';

export interface UsuarioEmail {
  idUsuario: number;
  email: string;
}

export class UsuarioRepository {
  async getById(id: string): Promise<UsuarioEmail | null> {
    return request<UsuarioEmail>(`/admin/auth/usuarios/${id}`);
  }
}

export const usuarioRepository = new UsuarioRepository();
