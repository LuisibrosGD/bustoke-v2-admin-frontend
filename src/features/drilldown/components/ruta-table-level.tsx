'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRutas } from '../application/use-entity-data';
import {
  DataTable,
  DataTableEmpty,
  Input,
  Button,
  Skeleton,
} from '@/components/ui';
import { SearchIcon, XIcon, ArrowRight, Pencil, Eye } from 'lucide-react';
import type { Ruta } from '@/infrastructure/domain/types';
import type { ColumnDef } from '@tanstack/react-table';

export function RutaTableLevel({
  agencyId,
  agencyLabel,
}: {
  agencyId: string;
  agencyLabel: string;
}) {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useRutas({ idAgencia: agencyId });

  const filtered = useMemo(() => {
    const byAgency = data.filter((r) => r.idAgencia === agencyId);
    if (!search) return byAgency;
    const lower = search.toLowerCase();
    return byAgency.filter(
      (r) =>
        r.idTerminalOrigen.toLowerCase().includes(lower) ||
        r.idTerminalDestino.toLowerCase().includes(lower)
    );
  }, [search, agencyId, data]);

  const columns = useMemo<ColumnDef<Ruta>[]>(
    () => [
      {
        id: 'expand',
        header: '',
        cell: ({ row }) => (
          <Link href={`/agencias/${agencyId}/rutas/${row.original.id}/viajes`}>
            <Button variant="ghost" size="icon" className="size-8" title="Ver viajes">
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        ),
      },
      {
        id: 'origen',
        header: 'Origen',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.terminalOrigenNombre ?? row.original.idTerminalOrigen}</span>
        ),
      },
      {
        id: 'destino',
        header: 'Destino',
        cell: ({ row }) => (
          <span>{row.original.terminalDestinoNombre ?? row.original.idTerminalDestino}</span>
        ),
      },
      {
        accessorKey: 'tarifaBase',
        header: 'Tarifa Base',
        cell: ({ row }) => `S/ ${Number(row.getValue('tarifaBase')).toFixed(2)}`,
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Link href={`/rutas/${row.original.id}`}>
              <Button variant="ghost" size="icon" className="size-8" title="Ver detalle">
                <Eye className="size-4" />
              </Button>
            </Link>
            <Link href={`/rutas/${row.original.id}/editar`}>
              <Button variant="ghost" size="icon" className="size-8" title="Editar">
                <Pencil className="size-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [agencyId]
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
              placeholder="Buscar por origen o destino..."
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
              title="Sin rutas"
              description={`${agencyLabel} no tiene rutas registradas.`}
            />
          }
        />
      </div>

    </div>
  );
}
