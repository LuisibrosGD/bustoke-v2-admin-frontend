'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import type { EstadoTicketSoporte, TicketSoporte } from '@/infrastructure/domain/types';
import { soporteRepository } from '@/infrastructure/repositories';
import { cn } from '@/lib/utils/style';

interface ColumnProps {
  isSuperadmin: boolean;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

// Mismo mapeo que el Badge de estado en /soporte/[id].
const ESTADO_VARIANT: Record<string, 'warning' | 'info' | 'success'> = {
  abierto: 'warning',
  en_revision: 'info',
  resuelto: 'success',
};

const ESTADO_LABEL: Record<string, string> = {
  abierto: 'Abierto',
  en_revision: 'En revisión',
  resuelto: 'Resuelto',
};

const ESTADO_SELECT_CLASS: Record<string, string> = {
  abierto: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50',
  en_revision: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/50',
  resuelto: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50',
};

export function useSoporteColumns({ isSuperadmin, onDelete, onRefresh }: ColumnProps): ColumnDef<TicketSoporte>[] {
  return [
    {
      accessorKey: 'asunto',
      header: 'Asunto',
      cell: ({ row }) => (
        <Link href={`/soporte/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.getValue('asunto')}
        </Link>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const current = row.getValue('estado') as string;
        if (!isSuperadmin) {
          return (
            <Badge variant={ESTADO_VARIANT[current] ?? 'neutral'}>{ESTADO_LABEL[current] ?? current}</Badge>
          );
        }
        const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
          await soporteRepository.update(row.original.id, { estado: e.target.value as EstadoTicketSoporte });
          onRefresh();
        };
        return (
          <select
            className={cn(
              'text-xs font-semibold rounded-full border-transparent px-2.5 py-0.5 cursor-pointer outline-none',
              ESTADO_SELECT_CLASS[current] ?? 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200/50'
            )}
            defaultValue={current}
            onChange={handleChange}
          >
            <option value="abierto">Abierto</option>
            <option value="en_revision">En revisión</option>
            <option value="resuelto">Resuelto</option>
          </select>
        );
      },
    },
    { accessorKey: 'fechaCreacion', header: 'Fecha', cell: ({ row }) => <span>{new Date(row.getValue('fechaCreacion')).toLocaleDateString('es-PE')}</span> },
    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon-sm" onClick={() => onDelete(row.original.id)}>
            <Trash2 className="size-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];
}
