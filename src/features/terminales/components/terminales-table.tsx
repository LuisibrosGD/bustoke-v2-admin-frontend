'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useUserRole } from '@/hooks';
import { Input, Button } from '@/components/ui';
import { SearchIcon, Eye, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTableEmpty } from '@/components/ui/data-table/data-table-empty';
import { terminalesColumns } from './terminales-columns';
import type { Terminal } from '@/infrastructure/domain/types';

interface Props {
  data: Terminal[];
  onEdit: (terminal: Terminal) => void;
  onDelete: (terminal: Terminal) => void;
}

export function TerminalesTable({ data, onEdit, onDelete }: Props) {
  const [s, setS] = useState('');
  const { isAdminTerminal } = useUserRole();
  const f = useMemo(() => {
    if (!s) return data;
    const l = s.toLowerCase();
    return data.filter((t) => t.nombre.toLowerCase().includes(l));
  }, [data, s]);

  const columns = useMemo(() => [
    ...terminalesColumns,
    {
      id: 'acciones' as const,
      header: 'Acciones',
      cell: ({ row }: { row: { original: Terminal } }) => (
        <div className="flex items-center gap-1">
          <Link href={`/terminales/${row.original.id}`}>
            <Button variant="ghost" size="icon" className="size-8" title="Ver detalle">
              <Eye className="size-4" />
            </Button>
          </Link>
          {!isAdminTerminal && (
            <>
              <Button variant="ghost" size="icon" className="size-8" title="Editar" onClick={() => onEdit(row.original)}>
                <Pencil className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8" title="Eliminar" onClick={() => onDelete(row.original)}>
                <Trash2 className="size-4 text-red-500" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ], [onEdit, onDelete, isAdminTerminal]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar terminal..." className="pl-9" value={s} onChange={(e) => setS(e.target.value)} />
      </div>
      <DataTable
        columns={columns}
        data={f}
        emptyElement={<DataTableEmpty title="Sin resultados" description="No se encontraron terminales." />}
      />
    </div>
  );
}
