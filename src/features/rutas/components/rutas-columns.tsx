'use client';

import { ColumnDef } from '@tanstack/react-table';
import type { Ruta } from '@/infrastructure/domain/types';

export const rutasColumns: ColumnDef<Ruta>[] = [
  {
    id: 'origen',
    header: 'Origen',
    cell: ({ row }) => <span>{row.original.terminalOrigenNombre ?? row.original.idTerminalOrigen}</span>,
  },
  {
    id: 'destino',
    header: 'Destino',
    cell: ({ row }) => <span>{row.original.terminalDestinoNombre ?? row.original.idTerminalDestino}</span>,
  },
  { accessorKey: 'tarifaBase', header: 'Tarifa Base', cell: ({ row }) => `S/ ${Number(row.getValue('tarifaBase')).toFixed(2)}` },
];
