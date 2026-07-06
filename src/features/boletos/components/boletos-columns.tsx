'use client';

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui';
import type { Boleto, Pasajero, Ruta, Viaje } from '@/infrastructure/domain/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const estadoColors: Record<string, string> = {
  activo: 'bg-emerald-100 text-emerald-800 border-transparent',
  cancelado: 'bg-red-100 text-red-800 border-transparent',
};

const estadoLabels: Record<string, string> = {
  activo: 'Activo',
  cancelado: 'Cancelado',
};

export function useBoletosColumns(pasajeros: Pasajero[], viajes: Viaje[], rutas: Ruta[]): ColumnDef<Boleto>[] {
  const pasajerosMap = useMemo(() => new Map(pasajeros.map((p) => [p.id, p])), [pasajeros]);
  const viajesMap = useMemo(() => new Map(viajes.map((v) => [v.id, v])), [viajes]);
  const rutasMap = useMemo(() => new Map(rutas.map((r) => [r.id, r])), [rutas]);

  return useMemo(() => [
    {
      id: 'codigo',
      header: 'Código QR',
      cell: ({ row }) => <span className="font-mono font-medium text-xs">{row.original.codigoQr}</span>,
    },
    {
      accessorKey: 'idPasajero',
      header: 'Pasajero',
      cell: ({ row }) => {
        const p = pasajerosMap.get(row.original.idPasajero);
        return p ? `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}` : row.original.idPasajero;
      },
    },
    {
      id: 'viaje',
      header: 'Viaje',
      cell: ({ row }) => {
        const v = viajesMap.get(row.original.idViaje);
        if (!v) return row.original.idViaje;
        const r = rutasMap.get(v.idRuta);
        const rutaLabel = r ? `${r.terminalOrigenNombre ?? '?'} → ${r.terminalDestinoNombre ?? '?'}` : null;
        return (
          <div className="flex flex-col gap-0.5">
            {rutaLabel && <span className="text-xs font-medium">{rutaLabel}</span>}
            <span className="text-xs text-muted-foreground">
              Sal: {format(new Date(v.fechaHoraSalida), 'dd/MM HH:mm', { locale: es })}
              {' · '}
              Lle: {format(new Date(v.fechaHoraLlegada), 'dd/MM HH:mm', { locale: es })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'precioFinal',
      header: 'Monto',
      cell: ({ row }) => `S/ ${Number(row.getValue('precioFinal')).toFixed(2)}`,
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.getValue('estado') as string;
        return (
          <Badge variant="outline" className={estadoColors[estado] ?? ''}>
            {estadoLabels[estado] ?? estado}
          </Badge>
        );
      },
    },
  ], [pasajerosMap, viajesMap, rutasMap]);
}
