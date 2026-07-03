'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui';
import type { Agencia } from '@/infrastructure/domain/types';

const estadoColor: Record<string, string> = {
  activa: 'bg-emerald-100 text-emerald-800 border-transparent',
  suspendida: 'bg-amber-100 text-amber-800 border-transparent',
};

export const agenciasColumns: ColumnDef<Agencia>[] = [
  { accessorKey: 'razonSocial', header: 'Razón Social', cell: ({ row }) => <span className="font-medium">{row.getValue('razonSocial')}</span> },
  { accessorKey: 'ruc', header: 'RUC' },
  { accessorKey: 'bancoNombre', header: 'Banco' },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => <Badge variant="outline" className={estadoColor[row.getValue('estado') as string]}>{row.getValue('estado')}</Badge>,
  },
];
