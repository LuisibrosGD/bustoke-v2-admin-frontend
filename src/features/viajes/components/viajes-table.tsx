'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useViajes } from '@/features/drilldown/application/use-entity-data';
import { Input, Button, DataTable, DataTableEmpty, Skeleton } from '@/components/ui';
import { SearchIcon, XIcon, Eye, PencilIcon, Trash2Icon } from 'lucide-react';
import { useViajesColumns } from './viajes-columns';
import { rutaRepository, busRepository, terminalRepository } from '@/infrastructure/repositories';
import type { Viaje, Ruta, Bus, Terminal } from '@/infrastructure/domain/types';

type Props = {
  onEdit: (viaje: Viaje) => void;
  onDelete: (viaje: Viaje) => void;
};

export function ViajesTable({ onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useViajes();
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [terminales, setTerminales] = useState<Terminal[]>([]);

  useEffect(() => {
    Promise.all([
      rutaRepository.list(),
      busRepository.list(),
      terminalRepository.list(),
    ]).then(([r, b, t]) => {
      setRutas(r);
      setBuses(b);
      setTerminales(t);
    }).catch(() => {});
  }, []);

  const viajesColumns = useViajesColumns(rutas, buses, terminales);

  const filtered = useMemo(() => {
    if (!search || !data) return data;
    const l = search.toLowerCase();
    return data.filter((v) => v.fechaHoraSalida.includes(l) || String(v.idRuta).toLowerCase().includes(l) || v.estado.includes(l));
  }, [search, data]);

  const columnsWithActions = useMemo(() => [
    ...viajesColumns,
    {
      id: 'acciones' as const,
      header: 'Acciones',
      cell: ({ row }: { row: { original: Viaje } }) => (
        <div className="flex items-center gap-1">
          <Link href={`/viajes/${row.original.id}`}>
            <Button variant="ghost" size="icon" className="size-8" title="Ver detalle">
              <Eye className="size-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="size-8" title="Editar" onClick={() => onEdit(row.original)}>
            <PencilIcon className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 text-red-600 hover:text-red-700 hover:bg-red-50" title="Eliminar" onClick={() => onDelete(row.original)}>
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      ),
    },
  ], [viajesColumns, onEdit, onDelete]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/50 shadow-sm p-6">
        <DataTableEmpty title="Error al cargar" description={error} />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 p-4 border-b border-neutral-100">
          <div className="relative w-full sm:flex-1 sm:max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <Input placeholder="Buscar viaje..." className="pl-9 border-neutral-200 bg-neutral-50/50 focus:bg-white" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {search && <Button variant="ghost" size="sm" onClick={() => setSearch('')}><XIcon className="size-4 mr-1" /> Limpiar</Button>}
        </div>
        <DataTable
          columns={columnsWithActions}
          data={filtered}
          emptyElement={
            <DataTableEmpty title="Sin resultados" description="No se encontraron viajes." />
          }
        />
      </div>

    </>
  );
}
