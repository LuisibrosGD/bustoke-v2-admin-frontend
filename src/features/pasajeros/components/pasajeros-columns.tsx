'use client';

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui';
import { Star } from 'lucide-react';
import type { Pasajero } from '@/infrastructure/domain/types';

/** Un pasajero con esta cantidad de boletos comprados o más se considera cliente frecuente. */
export const CLIENTE_FRECUENTE_MIN_BOLETOS = 3;

export function usePasajerosColumns(boletosPorPasajero: Map<string, number>): ColumnDef<Pasajero>[] {
  return useMemo(() => [
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
    {
      id: 'clienteFrecuente',
      header: 'Cliente frecuente',
      cell: ({ row }) => {
        const cantidad = boletosPorPasajero.get(row.original.id) ?? 0;
        if (cantidad < CLIENTE_FRECUENTE_MIN_BOLETOS) {
          return <span className="text-xs text-muted-foreground">{cantidad} boleto{cantidad === 1 ? '' : 's'}</span>;
        }
        return (
          <Badge variant="warning" className="gap-1">
            <Star className="size-3 fill-current" />
            Frecuente · {cantidad} boletos
          </Badge>
        );
      },
    },
  ], [boletosPorPasajero]);
}
