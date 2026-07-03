'use client';

import { useEffect, useMemo, useState } from 'react';
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Armchair, Crown, DoorOpen, Minus, Plus, ShowerHead, X } from 'lucide-react';
import { Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import type { Asiento, TipoServicio } from '@/infrastructure/domain/types';

const MIN_FILAS = 4;
const MAX_FILAS = 12;
const DEFAULT_FILAS = 10;

export type SeatDraft = Pick<
  Asiento,
  'numeroAsiento' | 'fila' | 'piso' | 'tipoServicio' | 'coordX' | 'coordY' | 'bloqueadoManual'
>;

function coordXFor(columna: number): number {
  return columna <= 2 ? columna * 20 : columna * 20 + 5;
}

function coordYFor(filaIndex: number): number {
  return 10 + filaIndex * 9;
}

function buildFloorSeats(
  piso: number,
  filas: number,
  defaultTipo: TipoServicio,
  overrides: Record<string, TipoServicio>
): SeatDraft[] {
  const seats: SeatDraft[] = [];
  for (let f = 0; f < filas; f++) {
    const filaLetra = String.fromCharCode(65 + f);
    for (let columna = 1; columna <= 4; columna++) {
      const numeroAsiento = `${filaLetra}${columna}-${piso}`;
      seats.push({
        numeroAsiento,
        fila: filaLetra,
        piso,
        tipoServicio: overrides[numeroAsiento] ?? defaultTipo,
        coordX: coordXFor(columna),
        coordY: coordYFor(f),
        bloqueadoManual: false,
      });
    }
  }
  return seats;
}

function inferFilas(seatsDelPiso: Asiento[]): number {
  if (seatsDelPiso.length === 0) return DEFAULT_FILAS;
  const maxLetra = seatsDelPiso.reduce((max, s) => (s.fila > max ? s.fila : max), 'A');
  return Math.min(MAX_FILAS, Math.max(MIN_FILAS, maxLetra.charCodeAt(0) - 65 + 1));
}

function BanoPaletteHandle() {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: 'bano-palette' });
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      style={{ transform: transform ? CSS.Translate.toString(transform) : undefined }}
      className={`flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-600 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      <ShowerHead className="size-4" />
      Arrastrar baño al piso
    </button>
  );
}

function BanoDropZone({ placed, onRemove }: { placed: boolean; onRemove: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'bano-dropzone' });
  return (
    <div
      ref={setNodeRef}
      className={`absolute left-[52%] bottom-[1%] flex size-12 -translate-x-1/2 items-center justify-center rounded-lg border-2 transition-colors ${
        placed
          ? 'border-blue-300 bg-blue-50 text-blue-600'
          : isOver
            ? 'border-blue-400 bg-blue-50/60 text-blue-400'
            : 'border-dashed border-neutral-300 text-neutral-300'
      }`}
      title={placed ? 'Baño' : 'Suelta aquí el baño'}
    >
      <ShowerHead className="size-5" />
      {placed && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-400 hover:text-red-500"
          title="Quitar baño"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}

interface FloorEditorProps {
  piso: number;
  filas: number;
  onFilasChange: (filas: number) => void;
  seats: SeatDraft[];
  onToggleSeat: (numeroAsiento: string) => void;
  onSetAll: (tipo: TipoServicio) => void;
  conBano: boolean;
  onBanoChange: (value: boolean) => void;
}

function FloorEditor({ piso, filas, onFilasChange, seats, onToggleSeat, onSetAll, conBano, onBanoChange }: FloorEditorProps) {
  const height = Math.max(360, filas * 48 + 110);

  function handleDragEnd(event: DragEndEvent) {
    if (event.over?.id === 'bano-dropzone') onBanoChange(true);
  }

  const vipCount = seats.filter((s) => s.tipoServicio === 'vip').length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">Filas (piso {piso})</span>
          <div className="flex items-center rounded-md border border-neutral-200">
            <Button variant="ghost" size="icon-sm" onClick={() => onFilasChange(Math.max(MIN_FILAS, filas - 1))} disabled={filas <= MIN_FILAS}>
              <Minus className="size-3.5" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{filas}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => onFilasChange(Math.min(MAX_FILAS, filas + 1))} disabled={filas >= MAX_FILAS}>
              <Plus className="size-3.5" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">({seats.length} asientos · {vipCount} VIP)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onSetAll('vip')}>
            <Crown className="size-3.5 text-amber-500" /> Todo VIP
          </Button>
          <Button variant="outline" size="sm" onClick={() => onSetAll('normal')}>
            <Armchair className="size-3.5" /> Todo Normal
          </Button>
        </div>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-wrap items-start gap-4">
          <div
            className="relative w-full max-w-[320px] rounded-2xl border-2 border-neutral-200 bg-neutral-50/40 shrink-0"
            style={{ height }}
          >
            <div className="absolute left-1/2 top-[1%] flex -translate-x-1/2 items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-medium text-neutral-500 border border-neutral-200">
              <DoorOpen className="size-3.5" /> Puerta
            </div>

            {seats.map((seat) => (
              <button
                key={seat.numeroAsiento}
                type="button"
                onClick={() => onToggleSeat(seat.numeroAsiento)}
                title={`${seat.numeroAsiento} — ${seat.tipoServicio}`}
                style={{ left: `${seat.coordX}%`, top: `${seat.coordY}%` }}
                className={`absolute flex -translate-x-1/2 -translate-y-1/2 size-9 items-center justify-center rounded-md border text-[10px] font-semibold transition-colors ${
                  seat.tipoServicio === 'vip'
                    ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {seat.tipoServicio === 'vip' ? <Crown className="size-3.5" /> : <Armchair className="size-3.5" />}
              </button>
            ))}

            <BanoDropZone placed={conBano} onRemove={() => onBanoChange(false)} />
          </div>

          {!conBano && (
            <div className="pt-2">
              <BanoPaletteHandle />
              <p className="mt-1.5 max-w-[160px] text-[11px] text-muted-foreground">
                Opcional: arrastra al recuadro del pasillo, al final del piso, si la unidad tiene baño.
              </p>
            </div>
          )}
        </div>
      </DndContext>
    </div>
  );
}

interface BusSeatMapEditorProps {
  cantidadPisos: number;
  initialAsientos?: Asiento[];
  onChange: (seats: SeatDraft[]) => void;
}

export function BusSeatMapEditor({ cantidadPisos, initialAsientos = [], onChange }: BusSeatMapEditorProps) {
  const seatsPiso1Iniciales = useMemo(() => initialAsientos.filter((a) => a.piso === 1), [initialAsientos]);
  const seatsPiso2Iniciales = useMemo(() => initialAsientos.filter((a) => a.piso === 2), [initialAsientos]);

  const [pisoActivo, setPisoActivo] = useState('1');
  const [filas, setFilas] = useState<Record<number, number>>({
    1: inferFilas(seatsPiso1Iniciales),
    2: inferFilas(seatsPiso2Iniciales),
  });
  const [overrides, setOverrides] = useState<Record<string, TipoServicio>>(() => {
    const map: Record<string, TipoServicio> = {};
    for (const s of initialAsientos) map[s.numeroAsiento] = s.tipoServicio;
    return map;
  });
  const [bano, setBano] = useState<Record<number, boolean>>({ 1: false, 2: false });

  function defaultTipo(piso: number): TipoServicio {
    return cantidadPisos === 2 && piso === 1 ? 'vip' : 'normal';
  }

  const seatsPiso1 = useMemo(
    () => buildFloorSeats(1, filas[1] ?? DEFAULT_FILAS, cantidadPisos === 2 ? 'vip' : 'normal', overrides),
    [filas, overrides, cantidadPisos]
  );
  const seatsPiso2 = useMemo(
    () => (cantidadPisos === 2 ? buildFloorSeats(2, filas[2] ?? DEFAULT_FILAS, 'normal', overrides) : []),
    [filas, overrides, cantidadPisos]
  );

  useEffect(() => {
    onChange([...seatsPiso1, ...seatsPiso2]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seatsPiso1, seatsPiso2]);

  function toggleSeat(numeroAsiento: string, piso: number) {
    setOverrides((prev) => {
      const actual = prev[numeroAsiento] ?? defaultTipo(piso);
      return { ...prev, [numeroAsiento]: actual === 'vip' ? 'normal' : 'vip' };
    });
  }

  function setAllFloor(piso: number, tipo: TipoServicio, seats: SeatDraft[]) {
    setOverrides((prev) => {
      const next = { ...prev };
      for (const s of seats) next[s.numeroAsiento] = tipo;
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="neutral">Plantilla de asientos</Badge>
        <span>Define filas, tipo de servicio (VIP/Normal) y ubicación del baño por piso.</span>
      </div>

      {cantidadPisos === 2 ? (
        <Tabs value={pisoActivo} onValueChange={setPisoActivo}>
          <TabsList>
            <TabsTrigger value="1">Piso 1</TabsTrigger>
            <TabsTrigger value="2">Piso 2</TabsTrigger>
          </TabsList>
          <TabsContent value="1">
            <FloorEditor
              piso={1}
              filas={filas[1] ?? DEFAULT_FILAS}
              onFilasChange={(n) => setFilas((p) => ({ ...p, 1: n }))}
              seats={seatsPiso1}
              onToggleSeat={(num) => toggleSeat(num, 1)}
              onSetAll={(tipo) => setAllFloor(1, tipo, seatsPiso1)}
              conBano={bano[1] ?? false}
              onBanoChange={(v) => setBano((p) => ({ ...p, 1: v }))}
            />
          </TabsContent>
          <TabsContent value="2">
            <FloorEditor
              piso={2}
              filas={filas[2] ?? DEFAULT_FILAS}
              onFilasChange={(n) => setFilas((p) => ({ ...p, 2: n }))}
              seats={seatsPiso2}
              onToggleSeat={(num) => toggleSeat(num, 2)}
              onSetAll={(tipo) => setAllFloor(2, tipo, seatsPiso2)}
              conBano={bano[2] ?? false}
              onBanoChange={(v) => setBano((p) => ({ ...p, 2: v }))}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <FloorEditor
          piso={1}
          filas={filas[1] ?? DEFAULT_FILAS}
          onFilasChange={(n) => setFilas((p) => ({ ...p, 1: n }))}
          seats={seatsPiso1}
          onToggleSeat={(num) => toggleSeat(num, 1)}
          onSetAll={(tipo) => setAllFloor(1, tipo, seatsPiso1)}
          conBano={bano[1] ?? false}
          onBanoChange={(v) => setBano((p) => ({ ...p, 1: v }))}
        />
      )}

      <p className="text-xs text-muted-foreground">
        Click en un asiento para cambiar entre VIP y Normal. La posición del baño es solo referencial (no se guarda todavía: el backend no tiene un campo para ello).
      </p>
    </div>
  );
}
