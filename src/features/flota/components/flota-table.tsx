'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useFlota } from '@/features/drilldown/application/use-entity-data';
import { Input, Button, DataTable, DataTableEmpty, Skeleton } from '@/components/ui';
import { SearchIcon, XIcon, Eye, Pencil, Trash2 } from 'lucide-react';
import { flotaColumns } from './flota-columns';
import type { Bus } from '@/infrastructure/domain/types';

interface Props {
  onDelete: (id: string) => void;
}

export function FlotaTable({ onDelete }: Props) {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useFlota();

  const filtered = useMemo(() => {
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter((b) =>
      b.placa.toLowerCase().includes(lower)
    );
  }, [search, data]);

  const columnsWithActions = useMemo(() => [
    ...flotaColumns,
    {
      id: 'acciones' as const,
      header: 'Acciones',
      cell: ({ row }: { row: { original: Bus } }) => (
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
          <Button variant="ghost" size="icon" className="size-8" title="Eliminar" onClick={() => onDelete(row.original.id)}>
            <Trash2 className="size-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ], [onDelete]);

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
    <>
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 p-4 border-b border-neutral-100">
          <div className="relative w-full sm:flex-1 sm:max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <Input placeholder="Buscar por placa, marca o modelo..." className="pl-9 border-neutral-200 bg-neutral-50/50 focus:bg-white" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {search && <Button variant="ghost" size="sm" onClick={() => setSearch('')}><XIcon className="size-4 mr-1" /> Limpiar</Button>}
        </div>
        <DataTable
          columns={columnsWithActions}
          data={filtered}
          emptyElement={<DataTableEmpty title="Sin resultados" description="No se encontraron buses." />}
        />
      </div>

    </>
  );
}
