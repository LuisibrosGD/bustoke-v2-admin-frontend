'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button/button';
import { Badge } from '@/components/ui/badge/badge';
import { ArrowLeft, Calendar, Eye, Bus as BusIcon } from 'lucide-react';
import { busRepository, rutaRepository, viajeRepository } from '@/infrastructure/repositories';
import { DataTable, DataTableEmpty } from '@/components/ui';
import type { Bus, Ruta, Viaje } from '@/infrastructure/domain/types';
import type { ColumnDef } from '@tanstack/react-table';

const estadoVariant: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
  programado: 'info',
  en_curso: 'warning',
  finalizado: 'success',
  cancelado: 'danger',
};

export default function ViajesRutaPage() {
  const params = useParams<{ id: string }>();
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [r, vv, bb] = await Promise.all([
          rutaRepository.getById(params.id),
          viajeRepository.findByRuta(params.id),
          busRepository.list(),
        ]);
        setRuta(r);
        setViajes(vv);
        setBuses(bb);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const busesMap = useMemo(() => new Map(buses.map((b) => [b.id, b])), [buses]);
  const rutaLabel = ruta
    ? `${ruta.terminalOrigenNombre ?? ruta.idTerminalOrigen} → ${ruta.terminalDestinoNombre ?? ruta.idTerminalDestino}`
    : 'Cargando...';

  const columns = useMemo<ColumnDef<Viaje>[]>(
    () => [
      {
        accessorKey: 'fechaHoraSalida',
        header: 'Salida',
        cell: ({ row }) => (
          <span className="font-medium flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground shrink-0" />
            {new Date(row.getValue('fechaHoraSalida')).toLocaleString('es-PE')}
          </span>
        ),
      },
      {
        id: 'bus',
        header: 'Bus',
        cell: ({ row }) => {
          const placa = busesMap.get(row.original.idBus)?.placa ?? '—';
          return (
            <span className="flex items-center gap-2">
              <BusIcon className="size-4 text-muted-foreground shrink-0" />
              {placa}
            </span>
          );
        },
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => (
          <Badge variant={estadoVariant[row.getValue('estado') as string] ?? 'neutral'}>
            {row.getValue('estado')}
          </Badge>
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Link href={`/viajes/${row.original.id}`}>
              <Button variant="ghost" size="icon" className="size-8" title="Ver detalle">
                <Eye className="size-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [busesMap]
  );

  if (loading) return <div className="p-6 text-muted-foreground">Cargando viajes...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <Button variant="outline" size="icon-sm" asChild>
            <Link href="/rutas">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Viajes — {rutaLabel}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Viajes programados en la ruta {rutaLabel}.
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={viajes}
          emptyElement={
            <DataTableEmpty
              title="Sin viajes"
              description={`La ruta ${rutaLabel} no tiene viajes registrados.`}
            />
          }
        />
      </div>
    </div>
  );
}
