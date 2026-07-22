'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Armchair,
  Coffee,
  Crown,
  Footprints,
  Info,
  Minus,
  PenLine,
  Plus,
  ShipWheel,
  ShowerHead,
  Tv,
  X as XIcon,
} from 'lucide-react';
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui';
import type { Amenidad, Asiento, TipoAmenidad, TipoServicio } from '@/infrastructure/domain/types';

const MIN_ROWS = 3;
const MAX_ROWS = 20;
const DEFAULT_ROWS = 8;
const MIN_COLS = 2;
const MAX_COLS = 6;
const DEFAULT_COLS = 4;

export type SeatDraft = Pick<
  Asiento,
  'numeroAsiento' | 'fila' | 'piso' | 'tipoServicio' | 'coordX' | 'coordY' | 'bloqueadoManual'
>;
export type AmenidadDraft = Pick<Amenidad, 'tipo' | 'piso' | 'coordX' | 'coordY'>;

type GridCell =
  | { kind: 'vacio' }
  | { kind: 'asiento'; numero: string; tipoServicio: TipoServicio }
  | { kind: 'amenidad'; tipoAmenidad: TipoAmenidad };

interface FloorState {
  rows: number;
  cols: number;
  grid: GridCell[][];
}

type Tool =
  | { kind: 'asiento'; tipoServicio: TipoServicio }
  | { kind: 'vacio' }
  | { kind: 'amenidad'; tipoAmenidad: TipoAmenidad }
  | { kind: 'renombrar' };

const AMENIDAD_ICON: Record<TipoAmenidad, typeof Tv> = {
  tv: Tv,
  bano: ShowerHead,
  escaleras: Footprints,
  cafetera: Coffee,
};

const AMENIDAD_LABEL: Record<TipoAmenidad, string> = {
  tv: 'TV',
  bano: 'Baño',
  escaleras: 'Escaleras',
  cafetera: 'Cafetera',
};

const PISO_LABEL: Record<number, string> = {
  1: 'Cubierta inferior',
  2: 'Cubierta superior',
};

function emptyFloor(rows: number, cols: number): FloorState {
  return {
    rows,
    cols,
    grid: Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ kind: 'vacio' as const }))),
  };
}

function resizeFloor(floor: FloorState, rows: number, cols: number): FloorState {
  const grid: GridCell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => floor.grid[r]?.[c] ?? { kind: 'vacio' as const })
  );
  return { rows, cols, grid };
}

/** Agrupa valores cercanos (distancia <= tolerancia) en el mismo cluster y
 * devuelve los representantes ordenados — sirve para reconstruir "filas" a
 * partir de coordY sin depender de una fórmula exacta. */
function clusterValues(values: number[], tolerancia = 4): number[] {
  const ordenados = [...new Set(values)].sort((a, b) => a - b);
  const clusters: number[] = [];
  for (const v of ordenados) {
    const ultimo = clusters[clusters.length - 1];
    if (ultimo === undefined || v - ultimo > tolerancia) clusters.push(v);
  }
  return clusters;
}

function clusterIndexMasCercano(clusters: number[], valor: number): number {
  let mejor = 0;
  let mejorDist = Infinity;
  clusters.forEach((c, i) => {
    const d = Math.abs(c - valor);
    if (d < mejorDist) {
      mejorDist = d;
      mejor = i;
    }
  });
  return mejor;
}

/** Reconstruye la grilla de un piso a partir de los asientos/amenidades ya
 * guardados, agrupando por posición (coordY -> fila, orden de coordX ->
 * columna) en vez de asumir una fórmula de coordenadas particular. Así
 * funciona tanto con datos viejos (grilla fija de 4 columnas) como nuevos. */
function buildFloorFromData(piso: number, asientos: Asiento[], amenidades: Amenidad[]): FloorState {
  const seatsPiso = asientos.filter((a) => a.piso === piso);
  const amenPiso = amenidades.filter((a) => a.piso === piso);

  if (seatsPiso.length === 0 && amenPiso.length === 0) {
    return emptyFloor(DEFAULT_ROWS, DEFAULT_COLS);
  }

  type Item = { y: number; x: number; cell: GridCell };
  const items: Item[] = [
    ...seatsPiso.map((s): Item => ({
      y: s.coordY,
      x: s.coordX,
      cell: { kind: 'asiento', numero: s.numeroAsiento, tipoServicio: s.tipoServicio },
    })),
    ...amenPiso.map((a): Item => ({
      y: a.coordY,
      x: a.coordX,
      cell: { kind: 'amenidad', tipoAmenidad: a.tipo },
    })),
  ];

  const yClusters = clusterValues(items.map((i) => i.y));
  const porFila = new Map<number, Item[]>();
  for (const item of items) {
    const r = clusterIndexMasCercano(yClusters, item.y);
    if (!porFila.has(r)) porFila.set(r, []);
    porFila.get(r)!.push(item);
  }

  const rows = Math.max(yClusters.length, MIN_ROWS);
  let cols = MIN_COLS;
  const filasOrdenadas: GridCell[][] = [];
  for (let r = 0; r < yClusters.length; r++) {
    const fila = (porFila.get(r) ?? []).sort((a, b) => a.x - b.x).map((i) => i.cell);
    filasOrdenadas.push(fila);
    cols = Math.max(cols, fila.length);
  }
  cols = Math.min(cols, MAX_COLS);

  return resizeFloor({ rows: filasOrdenadas.length, cols, grid: filasOrdenadas }, rows, cols);
}

function coordXFor(col: number, cols: number): number {
  if (cols <= 1) return 50;
  return Math.round(5 + (col * 90) / (cols - 1));
}

function coordYFor(row: number): number {
  return 10 + row * 9;
}

function siguienteNumeroAsiento(pisos: Record<number, FloorState>): string {
  let max = 0;
  for (const floor of Object.values(pisos)) {
    for (const fila of floor.grid) {
      for (const celda of fila) {
        if (celda.kind === 'asiento') {
          const n = parseInt(celda.numero, 10);
          if (!Number.isNaN(n) && n > max) max = n;
        }
      }
    }
  }
  return String(max + 1);
}

function construirDrafts(pisos: Record<number, FloorState>): { seats: SeatDraft[]; amenidades: AmenidadDraft[] } {
  const seats: SeatDraft[] = [];
  const amenidades: AmenidadDraft[] = [];
  for (const [pisoStr, floor] of Object.entries(pisos)) {
    const piso = Number(pisoStr);
    floor.grid.forEach((fila, r) => {
      fila.forEach((celda, c) => {
        if (celda.kind === 'asiento') {
          seats.push({
            numeroAsiento: celda.numero,
            fila: String.fromCharCode(65 + r),
            piso,
            tipoServicio: celda.tipoServicio,
            coordX: coordXFor(c, floor.cols),
            coordY: coordYFor(r),
            bloqueadoManual: false,
          });
        } else if (celda.kind === 'amenidad') {
          amenidades.push({
            tipo: celda.tipoAmenidad,
            piso,
            coordX: coordXFor(c, floor.cols),
            coordY: coordYFor(r),
          });
        }
      });
    });
  }
  return { seats, amenidades };
}

interface FloorEditorProps {
  piso: number;
  floor: FloorState;
  editing: { row: number; col: number } | null;
  modoRenombrar: boolean;
  onCellClick: (row: number, col: number) => void;
  onEditCommit: (row: number, col: number, valor: string) => void;
  onEditCancel: () => void;
  onResize: (rows: number, cols: number) => void;
}

function FloorEditor({ piso, floor, editing, modoRenombrar, onCellClick, onEditCommit, onEditCancel, onResize }: FloorEditorProps) {
  const totalAsientos = floor.grid.flat().filter((c) => c.kind === 'asiento').length;
  const totalVip = floor.grid.flat().filter((c) => c.kind === 'asiento' && c.tipoServicio === 'vip').length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {piso === 1 && (
            <span title="Frente del bus">
              <ShipWheel className="size-4 text-neutral-400" />
            </span>
          )}
          <span className="text-sm font-medium text-neutral-700">{PISO_LABEL[piso] ?? `Piso ${piso}`}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-md border border-neutral-200">
            <span className="pl-2 text-[11px] text-neutral-400">Filas</span>
            <Button variant="ghost" size="icon-sm" onClick={() => onResize(Math.max(MIN_ROWS, floor.rows - 1), floor.cols)} disabled={floor.rows <= MIN_ROWS}>
              <Minus className="size-3.5" />
            </Button>
            <span className="w-6 text-center text-sm font-medium">{floor.rows}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => onResize(Math.min(MAX_ROWS, floor.rows + 1), floor.cols)} disabled={floor.rows >= MAX_ROWS}>
              <Plus className="size-3.5" />
            </Button>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-neutral-200">
            <span className="pl-2 text-[11px] text-neutral-400">Columnas</span>
            <Button variant="ghost" size="icon-sm" onClick={() => onResize(floor.rows, Math.max(MIN_COLS, floor.cols - 1))} disabled={floor.cols <= MIN_COLS}>
              <Minus className="size-3.5" />
            </Button>
            <span className="w-6 text-center text-sm font-medium">{floor.cols}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => onResize(floor.rows, Math.min(MAX_COLS, floor.cols + 1))} disabled={floor.cols >= MAX_COLS}>
              <Plus className="size-3.5" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">{totalAsientos} asientos · {totalVip} VIP</span>
        </div>
      </div>

      <div
        className="grid gap-2 rounded-2xl border-2 border-neutral-200 bg-neutral-50/40 p-4"
        style={{ gridTemplateColumns: `repeat(${floor.cols}, minmax(0, 1fr))` }}
      >
        {floor.grid.map((fila, r) =>
          fila.map((celda, c) => {
            const isEditing = editing?.row === r && editing?.col === c;
            if (isEditing && celda.kind === 'asiento') {
              return (
                <input
                  key={`${r}-${c}`}
                  autoFocus
                  defaultValue={celda.numero}
                  onBlur={(e) => onEditCommit(r, c, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    if (e.key === 'Escape') onEditCancel();
                  }}
                  className="flex aspect-square w-full items-center justify-center rounded-lg border border-primary bg-white text-center text-xs font-semibold outline-none"
                />
              );
            }

            if (celda.kind === 'asiento') {
              const vip = celda.tipoServicio === 'vip';
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  title={`Asiento ${celda.numero} — ${vip ? 'VIP' : 'Normal'}${modoRenombrar ? ' (click para renumerar)' : ''}`}
                  onClick={() => onCellClick(r, c)}
                  className={`flex aspect-square w-full flex-col items-center justify-center gap-0.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                    vip
                      ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {vip && <Crown className="size-3" />}
                  {celda.numero}
                </button>
              );
            }

            if (celda.kind === 'amenidad') {
              const Icon = AMENIDAD_ICON[celda.tipoAmenidad];
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  title={AMENIDAD_LABEL[celda.tipoAmenidad]}
                  onClick={() => onCellClick(r, c)}
                  className="flex aspect-square w-full items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-500 transition-colors hover:bg-blue-100"
                >
                  <Icon className="size-4" />
                </button>
              );
            }

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                title="Vacío"
                onClick={() => onCellClick(r, c)}
                className="flex aspect-square w-full items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-300 transition-colors hover:bg-neutral-200 hover:text-neutral-400"
              >
                <XIcon className="size-3.5" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

interface BusSeatMapEditorProps {
  cantidadPisos: number;
  initialAsientos?: Asiento[];
  initialAmenidades?: Amenidad[];
  onChange: (seats: SeatDraft[], amenidades: AmenidadDraft[]) => void;
}

export function BusSeatMapEditor({ cantidadPisos, initialAsientos = [], initialAmenidades = [], onChange }: BusSeatMapEditorProps) {
  const [pisos, setPisos] = useState<Record<number, FloorState>>(() => {
    const inicial: Record<number, FloorState> = {
      1: buildFloorFromData(1, initialAsientos, initialAmenidades),
    };
    if (cantidadPisos === 2) inicial[2] = buildFloorFromData(2, initialAsientos, initialAmenidades);
    return inicial;
  });

  const [tool, setTool] = useState<Tool>({ kind: 'asiento', tipoServicio: 'normal' });
  const [editing, setEditing] = useState<{ piso: number; row: number; col: number } | null>(null);

  useEffect(() => {
    const { seats, amenidades } = construirDrafts(pisos);
    onChange(seats, amenidades);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pisos]);

  function applyTool(piso: number, row: number, col: number) {
    if (tool.kind === 'renombrar') {
      const celda = pisos[piso].grid[row][col];
      if (celda.kind === 'asiento') setEditing({ piso, row, col });
      return;
    }
    setPisos((prev) => {
      const floor = prev[piso];
      const actual = floor.grid[row][col];
      let nueva: GridCell;
      if (tool.kind === 'vacio') {
        nueva = { kind: 'vacio' };
      } else if (tool.kind === 'asiento') {
        nueva = {
          kind: 'asiento',
          tipoServicio: tool.tipoServicio,
          numero: actual.kind === 'asiento' ? actual.numero : siguienteNumeroAsiento(prev),
        };
      } else {
        nueva = { kind: 'amenidad', tipoAmenidad: tool.tipoAmenidad };
      }
      const grid = floor.grid.map((f, r) => (r === row ? f.map((c, ci) => (ci === col ? nueva : c)) : f));
      return { ...prev, [piso]: { ...floor, grid } };
    });
  }

  function handleResize(piso: number, rows: number, cols: number) {
    setPisos((prev) => ({ ...prev, [piso]: resizeFloor(prev[piso], rows, cols) }));
  }

  function commitEdit(piso: number, row: number, col: number, valor: string) {
    const limpio = valor.trim();
    setEditing(null);
    if (!limpio) return;
    setPisos((prev) => {
      const floor = prev[piso];
      const actual = floor.grid[row][col];
      if (actual.kind !== 'asiento') return prev;
      const grid = floor.grid.map((f, r) =>
        r === row ? f.map((c, ci) => (ci === col ? { ...actual, numero: limpio } : c)) : f
      );
      return { ...prev, [piso]: { ...floor, grid } };
    });
  }

  const pisosOrdenados = useMemo(() => Object.keys(pisos).map(Number).sort((a, b) => a - b), [pisos]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50/60 p-2">
        <span className="px-1 text-xs font-medium text-neutral-500">Herramienta:</span>
        <Button
          type="button"
          size="sm"
          variant={tool.kind === 'asiento' && tool.tipoServicio === 'normal' ? 'default' : 'outline'}
          onClick={() => setTool({ kind: 'asiento', tipoServicio: 'normal' })}
        >
          <Armchair className="size-3.5" /> Normal
        </Button>
        <Button
          type="button"
          size="sm"
          variant={tool.kind === 'asiento' && tool.tipoServicio === 'vip' ? 'default' : 'outline'}
          onClick={() => setTool({ kind: 'asiento', tipoServicio: 'vip' })}
        >
          <Crown className="size-3.5" /> VIP
        </Button>
        {(Object.keys(AMENIDAD_ICON) as TipoAmenidad[]).map((tipo) => {
          const Icon = AMENIDAD_ICON[tipo];
          return (
            <Button
              key={tipo}
              type="button"
              size="sm"
              variant={tool.kind === 'amenidad' && tool.tipoAmenidad === tipo ? 'default' : 'outline'}
              onClick={() => setTool({ kind: 'amenidad', tipoAmenidad: tipo })}
            >
              <Icon className="size-3.5" /> {AMENIDAD_LABEL[tipo]}
            </Button>
          );
        })}
        <Button type="button" size="sm" variant={tool.kind === 'vacio' ? 'default' : 'outline'} onClick={() => setTool({ kind: 'vacio' })}>
          <XIcon className="size-3.5" /> Vaciar
        </Button>
        <Button type="button" size="sm" variant={tool.kind === 'renombrar' ? 'default' : 'outline'} onClick={() => setTool({ kind: 'renombrar' })}>
          <PenLine className="size-3.5" /> Renombrar
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="ml-1 flex size-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 transition-colors"
              aria-label="Ayuda del editor"
            >
              <Info className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Click en una celda para aplicar la herramienta seleccionada. Para cambiar el número de un asiento, usá la herramienta &quot;Renombrar&quot; y hacé click en el asiento.
          </TooltipContent>
        </Tooltip>
      </div>

      <div className={cantidadPisos === 2 ? 'grid grid-cols-1 gap-6 lg:grid-cols-2' : ''}>
        {pisosOrdenados.map((piso) => (
          <FloorEditor
            key={piso}
            piso={piso}
            floor={pisos[piso]}
            editing={editing?.piso === piso ? { row: editing.row, col: editing.col } : null}
            modoRenombrar={tool.kind === 'renombrar'}
            onCellClick={(row, col) => applyTool(piso, row, col)}
            onEditCommit={(row, col, valor) => commitEdit(piso, row, col, valor)}
            onEditCancel={() => setEditing(null)}
            onResize={(rows, cols) => handleResize(piso, rows, cols)}
          />
        ))}
      </div>
    </div>
  );
}
