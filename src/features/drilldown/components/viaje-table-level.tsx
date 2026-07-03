'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useViajes } from '../application/use-entity-data';
import {
  DataTable,
  DataTableEmpty,
  Input,
  Badge,
  Button,
  Skeleton,
} from '@/components/ui';
import { SearchIcon, XIcon, Calendar, BusIcon, ArrowRight, Eye } from 'lucide-react';
import { busRepository } from '@/infrastructure/repositories';
import type { Bus, Viaje } from '@/infrastructure/domain/types';
import type { ColumnDef } from '@tanstack/react-table';

const estadoVariant: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
  programado: 'info',
  en_curso: 'warning',
  finalizado: 'success',
  cancelado: 'danger',
};

export function ViajeTableLevel({
  rutaId,
  rutaLabel,
}: {
  rutaId: string;
  rutaLabel: string;
}) {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useViajes({ idRuta: rutaId });
  const [buses, setBuses] = useState<Bus[]>([]);

  useEffect(() => {
    busRepository.list().then(setBuses).catch(() => setBuses([]));
  }, []);

  const busesMap = useMemo(() => new Map(buses.map((b) => [b.id, b])), [buses]);

  const filtered = useMemo(() => {
    const byRuta = data.filter((v) => v.idRuta === rutaId);
    if (!search) return byRuta;
    const lower = search.toLowerCase();
    return byRuta.filter(
      (v) =>
        v.fechaHoraSalida.toLowerCase().includes(lower) ||
        v.rampaEmbarque.toLowerCase().includes(lower)
    );
  }, [search, rutaId, data]);

  const columns = useMemo<ColumnDef<Viaje>[]>(
    () => [
      {
        id: 'expand',
        header: '',
        cell: ({ row }) => (
          <Link href={`/viajes/${row.original.id}/boletos`}>
            <Button variant="ghost" size="icon" className="size-8" title="Ver boletos">
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        ),
      },
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
          const bus = busesMap.get(row.original.idBus);
          return bus ? (
            <span className="flex items-center gap-2">
              <BusIcon className="size-4 text-muted-foreground shrink-0" />
              {bus.placa}
            </span>
          ) : '—';
        },
      },
      {
        accessorKey: 'rampaEmbarque',
        header: 'Rampa',
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => (
          <Badge
            variant={estadoVariant[row.getValue('estado') as string] ?? 'neutral'}
          >
            {row.getValue('estado')}
          </Badge>
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <Link href={`/viajes/${row.original.id}`}>
            <Button variant="ghost" size="icon" className="size-8" title="Ver detalle">
              <Eye className="size-4" />
            </Button>
          </Link>
        ),
      },
    ],
    [busesMap]
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/50 shadow-sm p-6">
        <DataTableEmpty title="Error al cargar" description={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 p-4 border-b border-neutral-100">
          <div className="relative w-full sm:flex-1 sm:max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Buscar viajes..."
              className="pl-9 border-neutral-200 bg-neutral-50/50 focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <Button variant="ghost" size="sm" onClick={() => setSearch('')}>
              <XIcon className="size-4 mr-1" /> Limpiar
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={filtered}
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
