'use client';

import { ColumnDef } from '@tanstack/react-table';
import type { Terminal } from '@/infrastructure/domain/types';

export const terminalesColumns: ColumnDef<Terminal>[] = [
  { accessorKey: 'nombre', header: 'Nombre', cell: ({ row }) => <span className="font-medium">{row.getValue('nombre')}</span> },
  { accessorKey: 'direccion', header: 'Dirección' },
];
