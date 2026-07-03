'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useFlota } from '../application/use-entity-data';
import {
  DataTable,
  DataTableEmpty,
  Input,
  Button,
  Skeleton,
} from '@/components/ui';
import { SearchIcon, XIcon, ArrowRight, Pencil, Eye, Bus as BusIcon } from 'lucide-react';
import type { Bus } from '@/infrastructure/domain/types';
import type { ColumnDef } from '@tanstack/react-table';

export function FlotaTableLevel({
  agencyId,
  agencyLabel,
}: {
  agencyId: string;
  agencyLabel: string;
}) {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useFlota({ id_agencia: agencyId });

  const filtered = useMemo(() => {
    const byAgency = data.filter((b) => String(b.idAgencia) === agencyId);
    if (!search) return byAgency;
    const lower = search.toLowerCase();
    return byAgency.filter(
      (b) =>
        b.placa.toLowerCase().includes(lower)
    );
  }, [search, agencyId, data]);

  const columns = useMemo<ColumnDef<Bus>[]>(
    () => [
      {
        id: 'expand',
        header: '',
        cell: ({ row }) => (
          <Link href={`/flota/${row.original.id}`}>
            <Button variant="ghost" size="icon" className="size-8" title="Ver detalle">
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        ),
      },
      {
        accessorKey: 'placa',
        header: 'Placa',
        cell: ({ row }) => (
          <span className="font-medium flex items-center gap-2">
            <BusIcon className="size-4 text-muted-foreground shrink-0" />
            {row.getValue('placa')}
          </span>
        ),
      },
      {
        accessorKey: 'cantidadPisos',
        header: 'Pisos',
        cell: ({ row }) => <span>{row.getValue<number>('cantidadPisos')} piso(s)</span>,
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Link href={`/flota/${row.original.id}`}>
              <Button variant="ghost" size="icon" className="size-8" title="Ver detalle">
                <Eye className="size-4" />
              </Button>
            </Link>
            <Link href={`/flota/${row.original.id}/editar`}>
              <Button variant="ghost" size="icon" className="size-8" title="Editar">
                <Pencil className="size-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-6">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
              placeholder="Buscar por placa..."
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
              title="Sin buses"
              description={`${agencyLabel} no tiene buses registrados.`}
            />
          }
        />
      </div>

    </div>
  );
}
