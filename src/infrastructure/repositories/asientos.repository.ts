import type { Asiento, TipoServicio } from '@/infrastructure/domain/types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export interface TemplateDiff {
  crear: number;
  actualizar: number;
  eliminar: number;
}

export interface TemplateSyncResult {
  creados: number;
  actualizados: number;
  eliminados: number;
  eliminacionesFallidas: { numeroAsiento: string; motivo: string }[];
}

function camposDistintos(actual: Asiento, draft: Partial<Asiento>): boolean {
  return (
    (draft.fila !== undefined && draft.fila !== actual.fila) ||
    (draft.piso !== undefined && draft.piso !== actual.piso) ||
    (draft.tipoServicio !== undefined && draft.tipoServicio !== actual.tipoServicio) ||
    (draft.coordX !== undefined && draft.coordX !== actual.coordX) ||
    (draft.coordY !== undefined && draft.coordY !== actual.coordY) ||
    (draft.bloqueadoManual !== undefined && draft.bloqueadoManual !== actual.bloqueadoManual)
  );
}

export class AsientoRepository {
  async listByBus(busId: string): Promise<Asiento[]> {
    return request<Asiento[]>(`/admin/flota/buses/${busId}/asientos`);
  }

  async update(id: string, data: Partial<Asiento>): Promise<Asiento> {
    return request<Asiento>(`/admin/flota/asientos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async create(busId: string, data: Partial<Asiento>): Promise<Asiento> {
    return request<Asiento>('/admin/flota/asientos', {
      method: 'POST',
      body: JSON.stringify({ ...data, idBus: busId }),
    });
  }

  async delete(id: string): Promise<boolean> {
    await request<void>(`/admin/flota/asientos/${id}`, { method: 'DELETE' });
    return true;
  }

  /**
   * Compara la plantilla propuesta contra los asientos existentes del bus
   * (por numeroAsiento) sin tocar la red. Solo lo que cambió cuenta.
   */
  diffTemplate(existentes: Asiento[], draft: Partial<Asiento>[]): TemplateDiff {
    const existentesPorNumero = new Map(existentes.map((a) => [a.numeroAsiento, a]));
    const draftNumeros = new Set(draft.map((d) => d.numeroAsiento));

    let crear = 0;
    let actualizar = 0;
    for (const d of draft) {
      const actual = d.numeroAsiento ? existentesPorNumero.get(d.numeroAsiento) : undefined;
      if (!actual) crear++;
      else if (camposDistintos(actual, d)) actualizar++;
    }
    const eliminar = existentes.filter((a) => !draftNumeros.has(a.numeroAsiento)).length;

    return { crear, actualizar, eliminar };
  }

  /**
   * Sincroniza la plantilla de asientos: crea los nuevos, actualiza solo los
   * que cambiaron y elimina los que ya no están en el draft. A diferencia de
   * un borrar-todo-y-recrear, no toca los asientos sin cambios (evita errores
   * cuando el usuario guarda sin haber modificado nada) y no falla la
   * operación completa si un asiento no se puede eliminar por tener boletos
   * vendidos asociados (el backend responde 409 en ese caso).
   */
  async syncTemplate(busId: string, draft: Partial<Asiento>[]): Promise<TemplateSyncResult> {
    const existentes = await this.listByBus(busId);
    const existentesPorNumero = new Map(existentes.map((a) => [a.numeroAsiento, a]));
    const draftNumeros = new Set(draft.map((d) => d.numeroAsiento));

    let creados = 0;
    let actualizados = 0;
    for (const d of draft) {
      const actual = d.numeroAsiento ? existentesPorNumero.get(d.numeroAsiento) : undefined;
      if (!actual) {
        await this.create(busId, d);
        creados++;
      } else if (camposDistintos(actual, d)) {
        await this.update(actual.id, {
          fila: d.fila,
          piso: d.piso,
          tipoServicio: d.tipoServicio,
          coordX: d.coordX,
          coordY: d.coordY,
          bloqueadoManual: d.bloqueadoManual,
        });
        actualizados++;
      }
    }

    let eliminados = 0;
    const eliminacionesFallidas: { numeroAsiento: string; motivo: string }[] = [];
    for (const a of existentes) {
      if (draftNumeros.has(a.numeroAsiento)) continue;
      try {
        await this.delete(a.id);
        eliminados++;
      } catch (e) {
        eliminacionesFallidas.push({
          numeroAsiento: a.numeroAsiento,
          motivo: e instanceof Error ? e.message : 'Error desconocido',
        });
      }
    }

    return { creados, actualizados, eliminados, eliminacionesFallidas };
  }
}

export const asientoRepository = new AsientoRepository();
