'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import type { EstadoReclamo, Reclamo } from '@/infrastructure/domain/types';
import { reclamoRepository } from '@/infrastructure/repositories';

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
        return (
          <select className="text-xs rounded border border-neutral-300 px-1 py-0.5 bg-white" defaultValue={row.getValue('estado') as string} onChange={handleChange}>
            <option value="abierto">abierto</option>
            <option value="en_proceso">en proceso</option>
            <option value="resuelto">resuelto</option>
          </select>
        );
      },
    },
    { accessorKey: 'fechaCreacion', header: 'Fecha', cell: ({ row }) => <span>{new Date(row.getValue('fechaCreacion')).toLocaleDateString('es-PE')}</span> },
  ];
}
