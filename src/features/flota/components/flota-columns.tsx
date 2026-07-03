'use client';

import { ColumnDef } from '@tanstack/react-table';
import type { Bus } from '@/infrastructure/domain/types';

export const flotaColumns: ColumnDef<Bus>[] = [
  { accessorKey: 'placa', header: 'Placa', cell: ({ row }) => <span className="font-mono font-medium">{row.getValue('placa')}</span> },
  { accessorKey: 'cantidadPisos', header: 'Pisos', cell: ({ row }) => <span>{row.getValue<number>('cantidadPisos')} piso(s)</span> },
];
