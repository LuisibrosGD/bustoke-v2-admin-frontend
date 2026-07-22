'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useUserRole, useClientPagination } from '@/hooks';
import { useRutas } from '@/features/drilldown/application/use-entity-data';
import { Input, Button, DataTable, DataTableEmpty, Skeleton } from '@/components/ui';
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination';
import { SearchIcon, XIcon, Eye, Pencil, Trash2 } from 'lucide-react';
import { rutasColumns } from './rutas-columns';
import type { Ruta } from '@/infrastructure/domain/types';

interface Props {
  onEdit: (ruta: Ruta) => void;
  onDelete: (id: string) => void;
}

export function RutasTable({ onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useRutas();
  const { isAdminTerminal } = useUserRole();

  const filtered = useMemo(() => {
    if (!search) return data;
    const l = search.toLowerCase();
    return data.filter((r) => (r.terminalOrigenNombre ?? r.idTerminalOrigen).toLowerCase().includes(l) || (r.terminalDestinoNombre ?? r.idTerminalDestino).toLowerCase().includes(l));
  }, [search, data]);
  const pagination = useClientPagination(filtered, 15);

  const columnsWithActions = useMemo(() => [
    ...rutasColumns,
    {
      id: 'acciones' as const,
      header: 'Acciones',
      cell: ({ row }: { row: { original: Ruta } }) => (
        <div className="flex items-center gap-1">
          <Link href={`/rutas/${row.original.id}`}>
            <Button variant="ghost" size="icon" className="size-8" title="Ver detalle">
              <Eye className="size-4" />
            </Button>
          </Link>
          {!isAdminTerminal && (
            <>
              <Button variant="ghost" size="icon" className="size-8" title="Editar" onClick={() => onEdit(row.original)}>
                <Pencil className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8" title="Eliminar" onClick={() => onDelete(row.original.id)}>
                <Trash2 className="size-4 text-red-500" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ], [onEdit, onDelete, isAdminTerminal]);

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
            <Input placeholder="Buscar por origen o destino..." className="pl-9 border-neutral-200 bg-neutral-50/50 focus:bg-white" value={search} onChange={(e) => { setSearch(e.target.value); pagination.resetPage(); }} />
          </div>
          {search && <Button variant="ghost" size="sm" onClick={() => setSearch('')}><XIcon className="size-4 mr-1" /> Limpiar</Button>}
        </div>
        <DataTable
          columns={columnsWithActions}
          data={pagination.pageItems}
          emptyElement={<DataTableEmpty title="Sin resultados" description="No se encontraron rutas." />}
        />
        {pagination.totalItems > 0 && (
          <div>
            <p className="text-xs text-muted-foreground px-4 pt-3 text-center sm:text-left">
              Mostrando {pagination.pageItems.length} de {pagination.totalItems} rutas
            </p>
            {pagination.totalPages > 1 && (
              <DataTablePagination
                pageIndex={pagination.pageIndex}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
                onPageChange={pagination.goToPage}
              />
            )}
          </div>
        )}
      </div>

    </>
  );
}
