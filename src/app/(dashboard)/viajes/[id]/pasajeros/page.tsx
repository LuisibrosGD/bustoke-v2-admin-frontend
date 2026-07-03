'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { viajeRepository, boletoRepository, rutaRepository, terminalRepository } from '@/infrastructure/repositories';
import { PasajerosTable } from '@/features/pasajeros/components/pasajeros-table';
import type { Viaje } from '@/infrastructure/domain/types';

export default function PasajerosViajePage() {
  const params = useParams<{ id: string }>();
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [rutaLabel, setRutaLabel] = useState('Ruta no disponible');
  const [pasCount, setPasCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const v = await viajeRepository.getById(params.id);
        if (!v) { setLoading(false); return; }
        setViaje(v);
        const [boletos, r] = await Promise.all([
          boletoRepository.getByViaje(v.id),
          rutaRepository.getById(v.idRuta),
        ]);
        setPasCount(boletos.length);
        if (r) {
          const [tO, tD] = await Promise.all([
            terminalRepository.getById(r.idTerminalOrigen),
            terminalRepository.getById(r.idTerminalDestino),
          ]);
          setRutaLabel(`${tO?.nombre ?? '?'} → ${tD?.nombre ?? '?'}`);
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <div className="p-6 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon-sm" asChild>
          <Link href={`/viajes/${params.id}`}><ArrowLeft className="size-4" /></Link>
        </Button>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex items-center gap-4">
        <div className="flex items-center justify-center size-12 rounded-lg bg-emerald-50 text-emerald-600">
          <Users className="size-6" />
        </div>
        <div>
          <p className="text-lg font-semibold text-neutral-900">
            {pasCount} pasajeros
          </p>
          <p className="text-sm text-neutral-500">
            {rutaLabel} — {viaje ? new Date(viaje.fechaHoraSalida).toLocaleDateString('es-PE') : ''}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">Lista de Pasajeros</h2>
        </div>
        <PasajerosTable viajeId={params.id} />
      </div>
    </div>
  );
}
