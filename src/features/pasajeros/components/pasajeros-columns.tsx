'use client';

import { ColumnDef } from '@tanstack/react-table';
import type { Pasajero } from '@/infrastructure/domain/types';

export const pasajerosColumns: ColumnDef<Pasajero>[] = [
  {
    id: 'nombreCompleto',
    header: 'Nombres',
    cell: ({ row }) => <span className="font-medium">{row.original.nombres} {row.original.apellidoPaterno} {row.original.apellidoMaterno}</span>,
  },
  {
    accessorKey: 'numeroDocumento',
    header: 'N° Documento',
    cell: ({ row }) => <span className="font-mono">{row.getValue('numeroDocumento')}</span>,
  },
  { accessorKey: 'fechaNacimiento', header: 'Fecha Nac.', cell: ({ row }) => row.getValue('fechaNacimiento') },
];
