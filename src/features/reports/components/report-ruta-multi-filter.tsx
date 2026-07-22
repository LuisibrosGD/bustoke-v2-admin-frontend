'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
import { GlobalCombobox } from '@/components/shared';
import { Button } from '@/components/ui';
import type { Ruta } from '@/infrastructure/domain/types';
import type { ComboboxOption } from '@/types/common.types';

interface RutaRow {
  key: string;
  origenId: string;
  destinoId: string;
}

interface ReportRutaMultiFilterProps {
  rutas: Ruta[];
  value: string[];
  onChange: (value: string[]) => void;
}

let rowKeySeq = 0;
function emptyRow(): RutaRow {
  rowKeySeq += 1;
  return { key: `row-${rowKeySeq}`, origenId: '', destinoId: '' };
}

function rowsFromValue(rutas: Ruta[], value: string[]): RutaRow[] {
  const vistas = new Set<string>();
  const rows: RutaRow[] = [];
  for (const rutaId of value) {
    const r = rutas.find((x) => String(x.id) === rutaId);
    if (!r) continue;
    const origenId = String(r.idTerminalOrigen);
    const destinoId = String(r.idTerminalDestino);
    const dedupeKey = `${origenId}>${destinoId}`;
    if (vistas.has(dedupeKey)) continue;
    vistas.add(dedupeKey);
    rowKeySeq += 1;
    rows.push({ key: `row-${rowKeySeq}`, origenId, destinoId });
  }
  rows.push(emptyRow());
  return rows;
}

function terminalOptions(rutas: Ruta[], origenId: string | null): ComboboxOption[] {
  const map = new Map<string, string>();
  for (const r of rutas) {
    if (origenId !== null && String(r.idTerminalOrigen) !== origenId) continue;
    const id = origenId === null ? String(r.idTerminalOrigen ?? '') : String(r.idTerminalDestino ?? '');
    const label = origenId === null ? r.terminalOrigenNombre : r.terminalDestinoNombre;
    if (id && !map.has(id)) map.set(id, label ?? id);
  }
  return [...map.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function matchingRutaIds(rutas: Ruta[], rows: RutaRow[]): string[] {
  const ids = new Set<string>();
  for (const row of rows) {
    if (!row.origenId || !row.destinoId) continue;
    for (const r of rutas) {
      if (String(r.idTerminalOrigen) === row.origenId && String(r.idTerminalDestino) === row.destinoId) {
        ids.add(String(r.id));
      }
    }
  }
  return [...ids];
}

/**
 * Selector de ruta por múltiples pares origen→destino (Diseño Propuesto 1):
 * cada fila se confirma sola al completar origen y destino, y siempre queda
 * una fila vacía al final para seguir agregando rutas.
 */
export function ReportRutaMultiFilter({ rutas, value, onChange }: ReportRutaMultiFilterProps) {
  const [rows, setRows] = useState<RutaRow[]>(() => rowsFromValue(rutas, value));
  const [todasLasRutas, setTodasLasRutas] = useState(value.length === 0);

  // `rutas` llega vacío en el primer render (se carga async en el padre);
  // si el filtro venía con valores desde la URL, hay que reconstruir las
  // filas apenas termine de cargar. Solo una vez, para no pisar ediciones
  // del usuario si `rutas` vuelve a cambiar después (p.ej. cambio de agencia).
  const yaResincronizado = useRef(rutas.length > 0 || value.length === 0);
  useEffect(() => {
    if (yaResincronizado.current || rutas.length === 0) return;
    yaResincronizado.current = true;
    setRows(rowsFromValue(rutas, value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rutas]);

  const origenOptions = useMemo(() => terminalOptions(rutas, null), [rutas]);

  function applyRows(next: RutaRow[]) {
    const ultima = next[next.length - 1];
    const conFilaVacia = ultima && (ultima.origenId || ultima.destinoId) ? [...next, emptyRow()] : next;
    setRows(conFilaVacia);
    setTodasLasRutas(false);
    onChange(matchingRutaIds(rutas, conFilaVacia));
  }

  function setRowOrigen(key: string, origenId: string) {
    applyRows(rows.map((r) => (r.key === key ? { ...r, origenId, destinoId: '' } : r)));
  }

  function setRowDestino(key: string, destinoId: string) {
    applyRows(rows.map((r) => (r.key === key ? { ...r, destinoId } : r)));
  }

  function removeRow(key: string) {
    const next = rows.filter((r) => r.key !== key);
    applyRows(next.length > 0 ? next : [emptyRow()]);
  }

  function limpiar() {
    setRows([emptyRow()]);
    setTodasLasRutas(false);
    onChange([]);
  }

  function toggleTodasLasRutas() {
    const next = !todasLasRutas;
    setTodasLasRutas(next);
    if (next) {
      setRows([emptyRow()]);
      onChange([]);
    }
  }

  return (
    <div className="space-y-2">
      <div className="divide-y rounded-md border border-neutral-200">
        {rows.map((row) => {
          const confirmada = !!(row.origenId && row.destinoId);
          return (
            <div key={row.key} className="flex items-center gap-2 p-2">
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                  confirmada ? 'border-neutral-700 bg-neutral-700 text-white' : 'border-neutral-300'
                }`}
                title={confirmada ? 'Ruta confirmada' : 'Completa origen y destino'}
              >
                {confirmada && <CheckIcon className="size-3" />}
              </span>
              <div className="min-w-0 flex-1">
                <GlobalCombobox
                  items={origenOptions}
                  value={row.origenId}
                  placeholder="Origen"
                  onChange={(v) => setRowOrigen(row.key, v)}
                />
              </div>
              <div className="min-w-0 flex-1">
                <GlobalCombobox
                  items={terminalOptions(rutas, row.origenId)}
                  value={row.destinoId}
                  placeholder="Destino"
                  disabled={!row.origenId}
                  onChange={(v) => setRowDestino(row.key, v)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                className="shrink-0 text-red-500 hover:text-red-600"
                title="Quitar ruta"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={todasLasRutas} onChange={toggleTodasLasRutas} />
          Agregar todas las rutas
        </label>
        <Button type="button" variant="outline" size="sm" onClick={limpiar}>
          Limpiar
        </Button>
      </div>
    </div>
  );
}
