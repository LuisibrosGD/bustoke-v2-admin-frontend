'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button/button';
import { ArrowLeft, Ticket } from 'lucide-react';
import { boletoRepository, viajeRepository, pasajeroRepository, asientoRepository } from '@/infrastructure/repositories';
import { DataTable, DataTableEmpty, Badge, Skeleton } from '@/components/ui';
import type { Boleto, Viaje, Pasajero, Asiento } from '@/infrastructure/domain/types';
import type { ColumnDef } from '@tanstack/react-table';

const estadoVariant: Record<string, 'success' | 'danger'> = {
  activo: 'success',
  cancelado: 'danger',
};

export default function BoletosViajePage() {
  const params = useParams<{ id: string }>();
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [pasajeros, setPasajeros] = useState<Map<string, Pasajero>>(new Map());
  const [asientos, setAsientos] = useState<Map<string, Asiento>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const v = await viajeRepository.getById(params.id);
        setViaje(v);
        const bs = await boletoRepository.getByViaje(params.id);
        setBoletos(bs);
        const pMap = new Map<string, Pasajero>();
        const aMap = new Map<string, Asiento>();
        // Cargar asientos del bus para resolver números
        if (v) {
          try {
            const asientos = await asientoRepository.listByBus(v.idBus);
            asientos.forEach((a) => aMap.set(a.id, a));
          } catch {}
        }
        // Cargar pasajeros
        await Promise.all(bs.map(async (b) => {
          try {
            const p = await pasajeroRepository.getById(b.idPasajero);
            if (p) pMap.set(b.idPasajero, p);
          } catch {}
        }));
        setPasajeros(pMap);
        setAsientos(aMap);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const columns = useMemo<ColumnDef<Boleto>[]>(
    () => [
      {
        id: 'codigoQr',
        header: 'Código QR',
        cell: ({ row }) => (
          <span className="font-medium flex items-center gap-2">
            <Ticket className="size-4 text-muted-foreground shrink-0" />
            {row.original.codigoQr}
          </span>
        ),
      },
      {
        id: 'pasajero',
        header: 'Pasajero',
        cell: ({ row }) => {
          const p = pasajeros.get(row.original.idPasajero);
          return p ? `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}` : <span className="text-muted-foreground">—</span>;
        },
      },
      {
        id: 'asiento',
        header: 'Asiento',
        cell: ({ row }) => {
          const a = asientos.get(row.original.idAsiento);
          return a?.numeroAsiento ?? <span className="text-muted-foreground">—</span>;
        },
      },
      {
        accessorKey: 'precioFinal',
        header: 'Monto',
        cell: ({ row }) => {
          const monto = Number(row.getValue('precioFinal'));
          return `S/ ${monto.toFixed(2)}`;
        },
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => (
          <Badge variant={estadoVariant[row.getValue('estado') as string] ?? 'neutral'}>
            {row.getValue('estado')}
          </Badge>
        ),
      },
    ],
    [pasajeros, asientos]
  );

  if (loading) return <div className="p-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <Button variant="outline" size="icon-sm" asChild>
            <Link href={`/viajes/${params.id}`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Boletos — Viaje {viaje ? new Date(viaje.fechaHoraSalida).toLocaleString('es-PE') : '...'}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Boletos emitidos para el viaje del {viaje ? new Date(viaje.fechaHoraSalida).toLocaleString('es-PE') : '...'}.
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <DataTable
          columns={columns}
          data={boletos}
          emptyElement={
            <DataTableEmpty
              title="Sin boletos"
              description="Este viaje no tiene boletos emitidos."
            />
          }
        />
      </div>
    </div>
  );
}
