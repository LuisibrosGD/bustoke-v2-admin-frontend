'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge/badge';
import { Button } from '@/components/ui/button/button';
import { Skeleton } from '@/components/ui';
import { ArrowLeft, Calendar, Users, Bus as BusIcon, Route, Ticket, ClipboardCheck, Armchair, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { viajeRepository, rutaRepository, busRepository, boletoRepository, terminalRepository } from '@/infrastructure/repositories';
import type { Viaje, Ruta, Bus, Terminal } from '@/infrastructure/domain/types';

const estadoBadgeVariant: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
  programado: 'info',
  en_curso: 'warning',
  finalizado: 'success',
  cancelado: 'danger',
};

const estadoLabel: Record<string, string> = {
  programado: 'Programado',
  en_curso: 'En curso',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

function InfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
      <span className="text-sm font-medium text-neutral-500 min-w-[140px]">{label}</span>
      <div className="text-sm text-neutral-900">{value}</div>
    </div>
  );
}

export default function ViajeDetailPage() {
  const params = useParams<{ id: string }>();
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [bus, setBus] = useState<Bus | null>(null);
  const [terminalOrigen, setTerminalOrigen] = useState<Terminal | null>(null);
  const [terminalDestino, setTerminalDestino] = useState<Terminal | null>(null);
  const [totalBoletos, setTotalBoletos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const v = await viajeRepository.getById(params.id);
        if (!v) { setLoading(false); return; }
        setViaje(v);
        const [r, b, boletos] = await Promise.all([
          rutaRepository.getById(v.idRuta),
          busRepository.getById(v.idBus),
          boletoRepository.getByViaje(v.id),
        ]);
        setTotalBoletos(boletos.length);
        if (r) {
          setRuta(r);
          const [tO, tD] = await Promise.all([
            terminalRepository.getById(r.idTerminalOrigen),
            terminalRepository.getById(r.idTerminalDestino),
          ]);
          if (tO) setTerminalOrigen(tO);
          if (tD) setTerminalDestino(tD);
        }
        if (b) setBus(b);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <div className="p-6 space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>;

  if (!viaje) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-medium text-neutral-900">Viaje no encontrado</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/viajes">
            <ArrowLeft className="size-4 mr-1" /> Volver a viajes
          </Link>
        </Button>
      </div>
    );
  }

  const fechaHoraSalida = new Date(viaje.fechaHoraSalida).toLocaleString('es-PE');
  const fechaHoraLlegada = new Date(viaje.fechaHoraLlegada).toLocaleString('es-PE');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Calendar className="size-5 text-neutral-500" />
            <h2 className="text-base font-semibold text-neutral-900">Programación</h2>
          </div>
          <InfoRow label="Salida" value={fechaHoraSalida} />
          <InfoRow label="Llegada" value={fechaHoraLlegada} />
          <InfoRow label="Rampa" value={viaje.rampaEmbarque} />
          <InfoRow
            label="Pasajeros"
            value={
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5 text-neutral-400" />
                {totalBoletos}
              </span>
            }
          />
          <InfoRow
            label="Estado"
            value={
              <Badge variant={estadoBadgeVariant[viaje.estado]}>
                {estadoLabel[viaje.estado] ?? viaje.estado}
              </Badge>
            }
          />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-blue-50 text-blue-600">
              <Route className="size-6" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Ruta</p>
              <p className="text-sm font-medium text-neutral-900">{terminalOrigen?.nombre ?? '—'} → {terminalDestino?.nombre ?? '—'}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-emerald-50 text-emerald-600">
              <BusIcon className="size-6" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Bus</p>
              <p className="text-sm font-medium text-neutral-900">{bus?.placa ?? viaje.idBus}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button variant="outline" className="h-auto p-4 flex items-center gap-3" asChild>
          <Link href={`/viajes/${params.id}/boletos`}>
            <Ticket className="size-5 text-blue-600 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-900">Boletos</p>
              <p className="text-xs text-neutral-500">Ver boletos emitidos</p>
            </div>
            <ArrowRight className="size-4 text-neutral-400 ml-auto shrink-0" />
          </Link>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex items-center gap-3" asChild>
          <Link href={`/viajes/${params.id}/pasajeros`}>
            <Users className="size-5 text-emerald-600 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-900">Pasajeros</p>
              <p className="text-xs text-neutral-500">Lista de pasajeros</p>
            </div>
            <ArrowRight className="size-4 text-neutral-400 ml-auto shrink-0" />
          </Link>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex items-center gap-3" asChild>
          <Link href={`/viajes/${params.id}/asientos`}>
            <Armchair className="size-5 text-amber-600 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-900">Asientos</p>
              <p className="text-xs text-neutral-500">Mapa de asientos</p>
            </div>
            <ArrowRight className="size-4 text-neutral-400 ml-auto shrink-0" />
          </Link>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex items-center gap-3" asChild>
          <Link href={`/viajes/${params.id}/check-in`}>
            <ClipboardCheck className="size-5 text-purple-600 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-900">Check-in</p>
              <p className="text-xs text-neutral-500">Registro de abordaje</p>
            </div>
            <ArrowRight className="size-4 text-neutral-400 ml-auto shrink-0" />
          </Link>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex items-center gap-3" asChild>
          <Link href={`/viajes/${params.id}/manifiesto`}>
            <FileSpreadsheet className="size-5 text-red-600 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-900">Manifiesto</p>
              <p className="text-xs text-neutral-500">Manifiesto SUTRAN</p>
            </div>
            <ArrowRight className="size-4 text-neutral-400 ml-auto shrink-0" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
