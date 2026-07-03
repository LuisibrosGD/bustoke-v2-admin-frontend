const API = '/api';

export interface UsuarioEmail {
  idUsuario: number;
  email: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export class UsuarioRepository {
  async getById(id: string): Promise<UsuarioEmail | null> {
    return request<UsuarioEmail>(`/admin/auth/usuarios/${id}`);
  }
}

export const usuarioRepository = new UsuarioRepository();
