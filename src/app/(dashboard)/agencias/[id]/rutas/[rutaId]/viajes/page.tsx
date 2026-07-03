'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button/button';
import { ViajeTableLevel } from '@/features/drilldown/components/viaje-table-level';
import { rutaRepository } from '@/infrastructure/repositories';
import { ArrowLeft } from 'lucide-react';
import type { Ruta } from '@/infrastructure/domain/types';

export default function ViajesRutaPage() {
  const params = useParams<{ id: string; rutaId: string }>();
  const [ruta, setRuta] = useState<Ruta | null>(null);

  useEffect(() => {
    rutaRepository.getById(params.rutaId).then(setRuta).catch(console.error);
  }, [params.rutaId]);

  const rutaLabel = ruta
    ? `${ruta.terminalOrigenNombre ?? ruta.idTerminalOrigen} → ${ruta.terminalDestinoNombre ?? ruta.idTerminalDestino}`
    : 'Cargando...';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <Button variant="outline" size="icon-sm" asChild>
            <Link href={`/agencias/${params.id}/rutas`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Viajes — {rutaLabel}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Viajes programados para la ruta {rutaLabel}.
            </p>
          </div>
        </div>
      </div>
      <ViajeTableLevel rutaId={params.rutaId} rutaLabel={rutaLabel} />
    </div>
  );
}
