'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge, Button } from '@/components/ui';
import { ArrowLeft, Building2, Banknote, Bus, Route, CalendarCheck, Edit } from 'lucide-react';
import { agenciaRepository, busRepository, rutaRepository, viajeRepository, asientoRepository } from '@/infrastructure/repositories';
import type { Agencia, Bus as BusType, Ruta, Viaje } from '@/infrastructure/domain/types';

const estadoVariant: Record<string, 'success' | 'danger'> = {
  activa: 'success',
  suspendida: 'danger',
};

function InfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
      <span className="text-sm font-medium text-neutral-500 min-w-[140px]">{label}</span>
      <div className="text-sm text-neutral-900">{value}</div>
    </div>
  );
}

export default function AgenciaDetailPage() {
  const params = useParams<{ id: string }>();
  const [agencia, setAgencia] = useState<Agencia | null>(null);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [seatCounts, setSeatCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const a = await agenciaRepository.getById(params.id);
        if (!a) { setLoading(false); return; }
        setAgencia(a);

        const [bb, rr, vv] = await Promise.all([
          busRepository.list({ id_agencia: a.id }),
          rutaRepository.list({ id_agencia: a.id }),
          viajeRepository.list({ id_agencia: a.id }),
        ]);
        setBuses(bb);
        setRutas(rr);
        setViajes(vv);

        const counts = await Promise.all(
          bb.map((bus) => asientoRepository.listByBus(bus.id).then((a) => [bus.id, a.length] as const).catch(() => [bus.id, 0] as const))
        );
        setSeatCounts(Object.fromEntries(counts));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <div className="p-6 text-muted-foreground">Cargando agencia...</div>;
  if (!agencia) return <div className="p-6 text-center text-muted-foreground">Agencia no encontrada</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-sm" asChild>
            <Link href="/agencias">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{agencia.razonSocial}</h1>
            <p className="text-sm text-muted-foreground">Detalle de agencia</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/agencias/${params.id}/editar`}>
            <Edit className="size-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Building2 className="size-5 text-neutral-500" />
            <h2 className="text-base font-semibold text-neutral-900">Información General</h2>
          </div>
          <InfoRow label="RUC" value={agencia.ruc} />
          <InfoRow label="Razón Social" value={agencia.razonSocial} />
          <InfoRow
            label="Estado"
            value={<Badge variant={estadoVariant[agencia.estado] || 'neutral'}>{agencia.estado}</Badge>}
          />
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Banknote className="size-5 text-neutral-500" />
            <h2 className="text-base font-semibold text-neutral-900">Datos Bancarios</h2>
          </div>
          <InfoRow label="Banco" value={agencia.bancoNombre || '—'} />
          <InfoRow label="N° Cuenta" value={agencia.numeroCuenta || '—'} />
          <InfoRow label="CCI" value={agencia.cuentaCci || '—'} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button variant="outline" className="h-auto p-5 flex items-center gap-4" asChild>
          <Link href={`/agencias/${params.id}/flota`}>
            <div className="flex items-center justify-center size-12 rounded-lg bg-blue-50 text-blue-600">
              <Bus className="size-6" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-2xl font-bold text-neutral-900">{buses.length}</p>
              <p className="text-sm text-neutral-500">Ver flota</p>
            </div>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto p-5 flex items-center gap-4" asChild>
          <Link href={`/agencias/${params.id}/rutas`}>
            <div className="flex items-center justify-center size-12 rounded-lg bg-emerald-50 text-emerald-600">
              <Route className="size-6" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-2xl font-bold text-neutral-900">{rutas.length}</p>
              <p className="text-sm text-neutral-500">Ver rutas</p>
            </div>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto p-5 flex items-center gap-4" asChild>
          <Link href="/viajes">
            <div className="flex items-center justify-center size-12 rounded-lg bg-amber-50 text-amber-600">
              <CalendarCheck className="size-6" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-2xl font-bold text-neutral-900">{viajes.length}</p>
              <p className="text-sm text-neutral-500">Viajes activos</p>
            </div>
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Bus className="size-5 text-neutral-500" />
            <h2 className="text-base font-semibold text-neutral-900">Flota de Buses</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="text-left px-6 py-3 font-medium text-neutral-500">Placa</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-500">Pisos</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-500">Asientos</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr key={bus.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-neutral-900">{bus.placa}</td>
                  <td className="px-6 py-3 text-neutral-600">{bus.cantidadPisos}</td>
                  <td className="px-6 py-3 text-neutral-600">{seatCounts[bus.id] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
