'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Armchair, Bus, Sofa, Crown, Lock, Unlock, DoorOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge/badge';
import { asientoRepository, boletoRepository, busRepository, viajeRepository } from '@/infrastructure/repositories';
import type { Asiento, Boleto, Bus as BusType, Viaje } from '@/infrastructure/domain/types';

const MIN_FILAS = 4;
const MAX_FILAS = 12;
const DEFAULT_FILAS = 10;

const tipoServicioIcon: Record<string, typeof Armchair> = {
  normal: Sofa,
  vip: Crown,
};

const tipoServicioLabel: Record<string, string> = {
  normal: 'Normal',
  vip: 'VIP',
};

const estadoStyle: Record<string, string> = {
  disponible: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
  ocupado: 'bg-neutral-100 border-neutral-300 text-neutral-400 cursor-not-allowed',
  mantenimiento: 'bg-yellow-50 border-yellow-200 text-yellow-600',
};

const estadoLabel: Record<string, string> = {
  disponible: 'Disponible',
  ocupado: 'Ocupado',
  mantenimiento: 'Mantenimiento',
};

function getAsientoEstado(asiento: Asiento, asientosOcupados: Set<string>): string {
  if (asiento.bloqueadoManual) return 'mantenimiento';
  if (asientosOcupados.has(asiento.id)) return 'ocupado';
  return 'disponible';
}

// Misma fórmula que src/features/flota/components/bus-seat-map-editor.tsx:
// la altura del contenedor está calibrada para que las filas (10 + fila*9)
// queden bien espaciadas, así que hay que estimar la cantidad de filas
// reales del piso para reproducir esas proporciones.
function inferFilas(seatsDelPiso: Asiento[]): number {
  if (seatsDelPiso.length === 0) return DEFAULT_FILAS;
  const maxLetra = seatsDelPiso.reduce((max, s) => (s.fila > max ? s.fila : max), 'A');
  return Math.min(MAX_FILAS, Math.max(MIN_FILAS, maxLetra.charCodeAt(0) - 65 + 1));
}

function SeatCard({ asiento, estado, onToggle }: { asiento: Asiento; estado: string; onToggle: (asiento: Asiento) => void }) {
  const Icon = tipoServicioIcon[asiento.tipoServicio] ?? Armchair;
  const bloqueado = estado === 'mantenimiento';
  const ocupado = estado === 'ocupado';

  return (
    <button
      type="button"
      data-seat-id={asiento.id}
      data-piso={asiento.piso}
      data-tipo-servicio={asiento.tipoServicio}
      data-estado={estado}
      style={{ left: `${asiento.coordX}%`, top: `${asiento.coordY}%` }}
      className={`absolute flex -translate-x-1/2 -translate-y-1/2 size-11 flex-col items-center justify-center gap-0.5 rounded-lg border text-[10px] font-medium transition-colors ${estadoStyle[estado]} ${ocupado ? '' : 'cursor-pointer'} group`}
      title={`${asiento.numeroAsiento} — ${tipoServicioLabel[asiento.tipoServicio]} — ${estadoLabel[estado]}`}
      onClick={() => !ocupado && onToggle(asiento)}
      disabled={ocupado}
    >
      <Icon className="size-4" />
      <span className="leading-none">{asiento.numeroAsiento}</span>
      {!ocupado && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          {bloqueado ? <Unlock className="size-4 text-white" /> : <Lock className="size-4 text-white" />}
        </div>
      )}
    </button>
  );
}

function FloorMap({ piso, asientos, asientosOcupados, onToggle }: { piso: number; asientos: Asiento[]; asientosOcupados: Set<string>; onToggle: (asiento: Asiento) => void }) {
  const filas = inferFilas(asientos);
  const height = Math.max(360, filas * 48 + 110);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-neutral-900">
          Piso {piso}
          <span className="ml-2 text-sm font-normal text-neutral-400">({asientos.length} asientos)</span>
        </h2>
        <div className="flex items-center gap-3">
          {(['normal', 'vip'] as const).map((tipo) => {
            const Icon = tipoServicioIcon[tipo];
            const count = asientos.filter((a) => a.tipoServicio === tipo).length;
            if (count === 0) return null;
            return (
              <span key={tipo} className="flex items-center gap-1 text-xs text-neutral-500">
                <Icon className="size-3.5" />
                {count}
              </span>
            );
          })}
        </div>
      </div>

      <div
        className="relative mx-auto w-full max-w-[320px] rounded-2xl border-2 border-neutral-200 bg-neutral-50/40"
        style={{ height }}
      >
        <div className="absolute left-1/2 top-[1%] flex -translate-x-1/2 items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-500">
          <DoorOpen className="size-3.5" /> Puerta
        </div>
        {asientos.map((asiento) => (
          <SeatCard
            key={asiento.id}
            asiento={asiento}
            estado={getAsientoEstado(asiento, asientosOcupados)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

export default function AsientosViajePage() {
  const params = useParams<{ id: string }>();
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [bus, setBus] = useState<BusType | null>(null);
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const asientosOcupados = new Set(boletos.map(b => b.idAsiento));

  useEffect(() => {
    (async () => {
      try {
        const v = await viajeRepository.getById(params.id);
        if (!v) { setLoading(false); return; }
        setViaje(v);
        const [b, bts] = await Promise.all([
          busRepository.getById(v.idBus),
          boletoRepository.getByViaje(v.id),
        ]);
        setBus(b);
        setBoletos(bts);
        if (b) {
          const asts = await asientoRepository.listByBus(b.id);
          setAsientos(asts);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar asientos');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  async function handleToggle(asiento: Asiento) {
    const nuevoEstado = !asiento.bloqueadoManual;
    try {
      const updated = await asientoRepository.update(asiento.id, { bloqueadoManual: nuevoEstado });
      setAsientos((prev) => prev.map((a) => (a.id === updated.id ? { ...a, bloqueadoManual: updated.bloqueadoManual } : a)));
    } catch (e) {
      console.error('Error al actualizar asiento', e);
    }
  }

  const piso1 = asientos.filter((a) => a.piso === 1);
  const piso2 = asientos.filter((a) => a.piso === 2);

  const totalDisponibles = asientos.filter((a) => getAsientoEstado(a, asientosOcupados) === 'disponible').length;
  const totalOcupados = asientos.filter((a) => getAsientoEstado(a, asientosOcupados) === 'ocupado').length;
  const totalMantenimiento = asientos.filter((a) => getAsientoEstado(a, asientosOcupados) === 'mantenimiento').length;

  if (!viaje || !bus) {
    return <div className="p-6 text-center text-muted-foreground">Viaje o bus no encontrado</div>;
  }

  if (loading) return <div className="p-6 text-muted-foreground">Cargando asientos...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {bus && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex items-start gap-4">
          <div className="flex items-center justify-center size-12 rounded-lg bg-amber-50 text-amber-600 shrink-0">
            <Bus className="size-6" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-neutral-900">{bus.placa}</p>
            <p className="text-sm text-neutral-500">
              {bus.cantidadPisos} piso{bus.cantidadPisos > 1 ? 's' : ''} &middot; {asientos.length} asientos
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-green-100 border border-green-300" />
              {totalDisponibles} libres
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-neutral-200 border border-neutral-300" />
              {totalOcupados} ocupados
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-yellow-100 border border-yellow-300" />
              {totalMantenimiento} mantenimiento
            </span>
          </div>
        </div>
      )}

      {[{ piso: 1, data: piso1 }, { piso: 2, data: piso2 }].map(({ piso, data }) => {
        if (data.length === 0) return null;
        return (
          <FloorMap key={piso} piso={piso} asientos={data} asientosOcupados={asientosOcupados} onToggle={handleToggle} />
        );
      })}

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <Sofa className="size-4 text-neutral-400" />
            <span className="text-neutral-500">Normal</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Crown className="size-4 text-neutral-400" />
            <span className="text-neutral-500">VIP</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="size-4 text-neutral-400" />
            <span className="text-neutral-500">Click para bloquear/desbloquear (asientos libres)</span>
          </span>
        </div>
        <Badge variant="info">conectado a API</Badge>
      </div>
    </div>
  );
}
