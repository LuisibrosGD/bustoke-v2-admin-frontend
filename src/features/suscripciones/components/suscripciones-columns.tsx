'use client';

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui';
import type { Agencia, Plan, Suscripcion } from '@/infrastructure/domain/types';

const estColor: Record<string, string> = { completado: 'bg-emerald-100 text-emerald-800', pendiente: 'bg-amber-100 text-amber-800', fallido: 'bg-red-100 text-red-800', reembolsado: 'bg-gray-100 text-gray-700' };

const formatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

export function useSuscripcionesColumns(agencias: Agencia[], planes: Plan[]): ColumnDef<Suscripcion>[] {
  const agenciasMap = useMemo(() => new Map(agencias.map((a) => [a.id, a])), [agencias]);
  const planesMap = useMemo(() => new Map(planes.map((p) => [p.id, p])), [planes]);

  return useMemo(() => [
    {
      id: 'agencia',
      header: 'Agencia',
      cell: ({ row }) => {
        const a = agenciasMap.get(row.original.idAgencia);
        return <span>{a?.razonSocial ?? row.original.idAgencia}</span>;
      },
    },
    {
      id: 'plan',
      header: 'Plan',
      cell: ({ row }) => {
        const plan = planesMap.get(row.original.idPlan);
        return <span>{plan?.nombre ?? row.original.idPlan}</span>;
      },
    },
    { accessorKey: 'montoMensual', header: 'Monto', cell: ({ row }) => <span>{formatter.format(row.getValue<number>('montoMensual'))}</span> },
    { accessorKey: 'fechaFacturacion', header: 'Facturación' },
    { accessorKey: 'estadoCobro', header: 'Estado', cell: ({ row }) => <Badge className={estColor[row.getValue('estadoCobro') as string]}>{row.getValue('estadoCobro')}</Badge> },
  ], [agenciasMap, planesMap]);
}
