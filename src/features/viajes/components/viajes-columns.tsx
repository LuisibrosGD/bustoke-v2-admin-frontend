'use client';

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui';
import type { Viaje, Ruta, Bus, Terminal } from '@/infrastructure/domain/types';

const estColor: Record<string, string> = {
  programado: 'bg-blue-100 text-blue-800 border-transparent',
  en_curso: 'bg-emerald-100 text-emerald-800 border-transparent',
  finalizado: 'bg-gray-100 text-gray-700 border-transparent',
  cancelado: 'bg-red-100 text-red-800 border-transparent',
};

const estLabel: Record<string, string> = {
  programado: 'Programado',
  en_curso: 'En curso',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

export function useViajesColumns(
  rutas: Ruta[],
  buses: Bus[],
  terminales: Terminal[],
) {
  const rutasMap = useMemo(() => new Map(rutas.map((r) => [r.id, r])), [rutas]);
  const busesMap = useMemo(() => new Map(buses.map((b) => [b.id, b])), [buses]);
  const terminalesMap = useMemo(() => new Map(terminales.map((t) => [t.id, t])), [terminales]);

  const columns: ColumnDef<Viaje>[] = useMemo(() => [
    {
      accessorKey: 'fechaHoraSalida',
      header: 'Salida',
      cell: ({ row }) => new Date(row.getValue('fechaHoraSalida')).toLocaleString('es-PE'),
    },
    {
      accessorKey: 'fechaHoraLlegada',
      header: 'Llegada',
      cell: ({ row }) => new Date(row.getValue('fechaHoraLlegada')).toLocaleString('es-PE'),
    },
    {
      id: 'terminalOrigen',
      header: 'Terminal Origen',
      cell: ({ row }) => {
        const ruta = rutasMap.get(row.original.idRuta);
        if (!ruta) return <span className="text-muted-foreground">?</span>;
        const t = terminalesMap.get(ruta.idTerminalOrigen);
        return <span>{t?.nombre ?? ruta.idTerminalOrigen}</span>;
      },
    },
    {
      id: 'terminalDestino',
      header: 'Terminal Destino',
      cell: ({ row }) => {
        const ruta = rutasMap.get(row.original.idRuta);
        if (!ruta) return <span className="text-muted-foreground">?</span>;
        const t = terminalesMap.get(ruta.idTerminalDestino);
        return <span>{t?.nombre ?? ruta.idTerminalDestino}</span>;
      },
    },
    {
      id: 'bus',
      header: 'Bus',
      cell: ({ row }) => {
        const bus = busesMap.get(row.original.idBus);
        return <span>{bus?.placa ?? <span className="text-muted-foreground">{row.original.idBus}</span>}</span>;
      },
    },
    { accessorKey: 'rampaEmbarque', header: 'Rampa' },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const v = row.getValue<string>('estado');
        return <Badge variant="outline" className={estColor[v]}>{estLabel[v] || v}</Badge>;
      },
    },
  ], [rutasMap, busesMap, terminalesMap]);

  return columns;
}
