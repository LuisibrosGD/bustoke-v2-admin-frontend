'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge, Button } from '@/components/ui';
import { ArrowLeft, Edit, Bus, Building2, CalendarDays } from 'lucide-react';
import { busRepository, agenciaRepository, viajeRepository, rutaRepository, terminalRepository, asientoRepository } from '@/infrastructure/repositories';
import type { Asiento, Viaje, Bus as BusType, Agencia, Ruta, Terminal } from '@/infrastructure/domain/types';

function InfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
      <span className="text-sm font-medium text-neutral-500 min-w-[140px]">{label}</span>
      <div className="text-sm text-neutral-900">{value}</div>
    </div>
  );
}

export default function BusDetailPage() {
  const params = useParams<{ id: string }>();
  const [bus, setBus] = useState<BusType | null>(null);
  const [agencia, setAgencia] = useState<Agencia | null>(null);
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [terminales, setTerminales] = useState<Terminal[]>([]);
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const b = await busRepository.getById(params.id);
        if (!b) { setLoading(false); return; }
        setBus(b);

        const [ag, vv, asts] = await Promise.all([
          agenciaRepository.getById(b.idAgencia),
          viajeRepository.list({ id_bus: b.id }),
          asientoRepository.listByBus(b.id),
        ]);
        setAgencia(ag);
        setViajes(vv);
        setAsientos(asts);

        const rutaIds = [...new Set(vv.map((v) => v.idRuta))];
        if (rutaIds.length > 0) {
          const [rt, tt] = await Promise.all([
            rutaRepository.list(),
            terminalRepository.list(),
          ]);
          setRutas(rt);
          setTerminales(tt);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  function rutaLabel(idRuta: string): string {
    const r = rutas.find((x) => x.id === idRuta);
    if (!r) return idRuta;
    const o = terminales.find((t) => t.id === r.idTerminalOrigen);
    const d = terminales.find((t) => t.id === r.idTerminalDestino);
    const oName = o?.nombre?.split(' - ')[0]?.split(' de ').pop() || o?.nombre || r.idTerminalOrigen;
    const dName = d?.nombre?.split(' - ')[0]?.split(' de ').pop() || d?.nombre || r.idTerminalDestino;
    return `${oName} → ${dName}`;
  }

  if (loading) return <div className="p-6 text-muted-foreground">Cargando bus...</div>;
  if (!bus) return <div className="p-6 text-center text-muted-foreground">Bus no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-sm" asChild>
            <Link href="/flota">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Bus {bus.placa}</h1>
            <p className="text-sm text-muted-foreground">Detalle de unidad</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/flota/${params.id}/asientos`}>
              <Bus className="size-4" />
              Mapa de asientos
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/flota/${params.id}/editar`}>
              <Edit className="size-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Bus className="size-5 text-neutral-500" />
            <h2 className="text-base font-semibold text-neutral-900">Información</h2>
          </div>
          <InfoRow label="Placa" value={bus.placa} />
          <InfoRow label="Cantidad de Pisos" value={String(bus.cantidadPisos)} />
          <InfoRow label="Total Asientos" value={String(asientos.length)} />
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Building2 className="size-5 text-neutral-500" />
            <h2 className="text-base font-semibold text-neutral-900">Agencia Asignada</h2>
          </div>
          <InfoRow
            label="Agencia"
            value={
              agencia ? (
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-neutral-400" />
                  {agencia.razonSocial}
                </span>
              ) : '—'
            }
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-neutral-500" />
            <h2 className="text-base font-semibold text-neutral-900">Últimos Viajes</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="text-left px-6 py-3 font-medium text-neutral-500">Fecha Salida</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-500">Ruta</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              {viajes.slice(-5).reverse().map((viaje) => (
                <tr key={viaje.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-3 text-neutral-900">
                    {new Date(viaje.fechaHoraSalida).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-6 py-3 text-neutral-600">{rutaLabel(viaje.idRuta)}</td>
                  <td className="px-6 py-3">
                    <Badge variant={
                      viaje.estado === 'cancelado' ? 'danger' :
                      viaje.estado === 'finalizado' ? 'success' :
                      viaje.estado === 'en_curso' ? 'warning' : 'neutral'
                    }>
                      {viaje.estado}
                    </Badge>
                  </td>
                </tr>
              ))}
              {viajes.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                    No hay viajes registrados para este bus
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
