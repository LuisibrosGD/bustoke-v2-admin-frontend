'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import type { EstadoReclamo, Reclamo } from '@/infrastructure/domain/types';
import { reclamoRepository } from '@/infrastructure/repositories';
import { cn } from '@/lib/utils/style';

// Mismos colores que el Badge de estado en /reclamos/[id] (warning/info/success),
// aplicados sobre un <select> nativo para mantener la edición inline en la tabla.
const ESTADO_SELECT_CLASS: Record<string, string> = {
  abierto: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50',
  en_proceso: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/50',
  resuelto: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50',
};

export function useReclamosColumns(onRefresh: () => void): ColumnDef<Reclamo>[] {
  return [
    {
      accessorKey: 'motivo',
      header: 'Motivo',
      cell: ({ row }) => (
        <Link href={`/reclamos/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.getValue('motivo')}
        </Link>
      ),
    },
    { accessorKey: 'detalle', header: 'Detalle', cell: ({ row }) => <span className="truncate max-w-xs block">{row.getValue('detalle')}</span> },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
          await reclamoRepository.update(row.original.id, { estado: e.target.value as EstadoReclamo });
          onRefresh();
        };
        const estado = row.getValue('estado') as string;
        return (
          <select
            className={cn(
              'text-xs font-semibold rounded-full border-transparent px-2.5 py-0.5 cursor-pointer outline-none',
              ESTADO_SELECT_CLASS[estado] ?? 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200/50'
            )}
            defaultValue={estado}
            onChange={handleChange}
          >
            <option value="abierto">Abierto</option>
            <option value="en_proceso">En proceso</option>
            <option value="resuelto">Resuelto</option>
          </select>
        );
      },
    },
    { accessorKey: 'fechaCreacion', header: 'Fecha', cell: ({ row }) => <span>{new Date(row.getValue('fechaCreacion')).toLocaleDateString('es-PE')}</span> },
  ];
}
