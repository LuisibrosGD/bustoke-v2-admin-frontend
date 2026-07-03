'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Armchair, Bus, Sofa, Crown, Lock, Unlock } from 'lucide-react';
import { Badge } from '@/components/ui/badge/badge';
import { asientoRepository, boletoRepository, busRepository, viajeRepository } from '@/infrastructure/repositories';
import type { Asiento, Boleto, Bus as BusType, Viaje } from '@/infrastructure/domain/types';

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

function SeatCard({ asiento, row, col, asientosOcupados, onToggle }: { asiento: Asiento; row: number; col: number; asientosOcupados: Set<string>; onToggle: (asiento: Asiento) => void }) {
  const estado = getAsientoEstado(asiento, asientosOcupados);
  const Icon = tipoServicioIcon[asiento.tipoServicio] ?? Armchair;
  const bloqueado = estado === 'mantenimiento';

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        data-seat-id={asiento.id}
        data-row={row}
        data-col={col}
        data-piso={asiento.piso}
        data-tipo-servicio={asiento.tipoServicio}
        data-estado={estado}
        className={`flex flex-col items-center justify-center gap-1 size-14 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${estadoStyle[estado]} relative group`}
        title={`${asiento.numeroAsiento} — ${tipoServicioLabel[asiento.tipoServicio]} — ${estadoLabel[estado]}`}
        onClick={() => onToggle(asiento)}
      >
        <Icon className="size-5" />
        <span className="leading-none">{asiento.numeroAsiento}</span>
        {estado !== 'ocupado' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
            {bloqueado ? <Unlock className="size-5 text-white" /> : <Lock className="size-5 text-white" />}
          </div>
        )}
      </div>
      {estado !== 'ocupado' && (
        <button
          className="text-[10px] text-neutral-400 hover:text-neutral-700 transition-colors"
          onClick={() => onToggle(asiento)}
        >
          {bloqueado ? 'Desbloquear' : 'Bloquear'}
        </button>
      )}
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
          <div key={piso} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-neutral-900">
                Piso {piso}
                <span className="ml-2 text-sm font-normal text-neutral-400">({data.length} asientos)</span>
              </h2>
              <div className="flex items-center gap-3">
                {(['normal', 'vip'] as const).map((tipo) => {
                  const Icon = tipoServicioIcon[tipo];
                  const count = data.filter((a) => a.tipoServicio === tipo).length;
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

            <div className="flex flex-wrap gap-3 max-w-3xl mx-auto">
              {data.map((asiento, idx) => {
                const col = idx % 4;
                const row = Math.floor(idx / 4);
                return (
                  <SeatCard key={asiento.id} asiento={asiento} row={row} col={col} asientosOcupados={asientosOcupados} onToggle={handleToggle} />
                );
              })}
            </div>
          </div>
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
            <span className="text-neutral-500">Hover para bloquear/desbloquear</span>
          </span>
        </div>
        <Badge variant="info">conectado a API</Badge>
      </div>
    </div>
  );
}
