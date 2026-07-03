'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import type { EstadoTicketSoporte, TicketSoporte } from '@/infrastructure/domain/types';
import { soporteRepository } from '@/infrastructure/repositories';

interface ColumnProps {
  isSuperadmin: boolean;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

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
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${current === 'abierto' ? 'bg-yellow-100 text-yellow-800' : current === 'en_revision' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              {current === 'en_revision' ? 'en revisión' : current}
            </span>
          );
        }
        const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
          await soporteRepository.update(row.original.id, { estado: e.target.value as EstadoTicketSoporte });
          onRefresh();
        };
        return (
          <select className="text-xs rounded border border-neutral-300 px-1 py-0.5 bg-white" defaultValue={current} onChange={handleChange}>
            <option value="abierto">abierto</option>
            <option value="en_revision">en revisión</option>
            <option value="resuelto">resuelto</option>
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
