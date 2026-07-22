const API = '/api';

function extraerMensaje(body: unknown, res: Response): string {
  if (body && typeof body === 'object') {
    const detail = (body as { detail?: unknown }).detail;
    if (typeof detail === 'string') return detail;
    // Errores de validación de FastAPI/Pydantic: detail es un arreglo de {msg, loc, ...}
    if (Array.isArray(detail) && detail[0] && typeof detail[0] === 'object' && 'msg' in detail[0]) {
      return String((detail[0] as { msg?: unknown }).msg ?? '') || `API error: ${res.status} ${res.statusText}`;
    }
    const message = (body as { message?: unknown }).message;
    if (typeof message === 'string') return message;
    const error = (body as { error?: unknown }).error;
    if (typeof error === 'string') return error;
  }
  return `API error: ${res.status} ${res.statusText}`;
}

/**
 * Cliente HTTP compartido por todos los repositorios del lado del cliente.
 * A diferencia de un `throw new Error(res.statusText)` genérico, propaga el
 * mensaje real que devuelve el backend (campo `detail` de FastAPI, o
 * `message`/`error` de las rutas propias de Next.js) para que los toasts de
 * error muestren algo útil en vez de "API error: 409 Conflict".
 */
export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(extraerMensaje(body, res));
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
