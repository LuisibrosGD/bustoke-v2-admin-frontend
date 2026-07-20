'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserRole, useClientPagination } from '@/hooks';
import { useViajes } from '@/features/drilldown/application/use-entity-data';
import { Input, Button, DataTable, DataTableEmpty, Skeleton } from '@/components/ui';
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination';
import { DateRangePicker } from '@/components/shared';
import { SearchIcon, XIcon, Eye, PencilIcon, Trash2Icon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { useViajesColumns } from './viajes-columns';
import { rutaRepository, busRepository, terminalRepository } from '@/infrastructure/repositories';
import type { Viaje, Ruta, Bus, Terminal } from '@/infrastructure/domain/types';

type Props = {
  onEdit: (viaje: Viaje) => void;
  onDelete: (viaje: Viaje) => void;
};

const ESTADOS = [
  { value: 'programado', label: 'Programado' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const selectClass = 'h-11 rounded-md border border-neutral-200 bg-neutral-50/50 px-3 text-sm focus:bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400';

export function ViajesTable({ onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [fecha, setFecha] = useState<DateRange | undefined>();
  const { data, isLoading, error } = useViajes({ limit: '500' });
  const { isAdminTerminal } = useUserRole();
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
  const terminalesMap = useMemo(() => new Map(terminales.map((t) => [t.id, t.nombre])), [terminales]);
  const rutasMap = useMemo(() => new Map(rutas.map((r) => [r.id, r])), [rutas]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const desde = fecha?.from ? new Date(fecha.from.getFullYear(), fecha.from.getMonth(), fecha.from.getDate()) : null;
    const hasta = fecha?.to ? new Date(fecha.to.getFullYear(), fecha.to.getMonth(), fecha.to.getDate(), 23, 59, 59) : null;

    return (data ?? []).filter((v) => {
      if (estado && v.estado !== estado) return false;
      if (desde || hasta) {
        const salida = new Date(v.fechaHoraSalida);
        if (desde && salida < desde) return false;
        if (hasta && salida > hasta) return false;
      }
      if (term) {
        const ruta = rutasMap.get(v.idRuta);
        const origen = ruta ? (terminalesMap.get(ruta.idTerminalOrigen) ?? '') : '';
        const destino = ruta ? (terminalesMap.get(ruta.idTerminalDestino) ?? '') : '';
        const haystack = `${origen} ${destino} ${v.rampaEmbarque ?? ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [data, search, estado, fecha, rutasMap, terminalesMap]);

  const pagination = useClientPagination(filtered, 15);
  const hasFilters = !!(search || estado || fecha?.from);

  function clearFilters() {
    setSearch('');
    setEstado('');
    setFecha(undefined);
    pagination.resetPage();
  }

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
          {!isAdminTerminal && (
            <>
              <Button variant="ghost" size="icon" className="size-8" title="Editar" onClick={() => onEdit(row.original)}>
                <PencilIcon className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8 text-red-600 hover:text-red-700 hover:bg-red-50" title="Eliminar" onClick={() => onDelete(row.original)}>
                <Trash2Icon className="size-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ], [viajesColumns, onEdit, onDelete, isAdminTerminal]);

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
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 p-4 border-b border-neutral-100">
        <div className="relative w-full sm:flex-1 sm:max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Buscar viaje..."
            className="pl-9 h-11 border-neutral-200 bg-neutral-50/50 focus:bg-white"
            value={search}
            onChange={(e) => { setSearch(e.target.value); pagination.resetPage(); }}
          />
        </div>
        <select
          className={selectClass}
          value={estado}
          onChange={(e) => { setEstado(e.target.value); pagination.resetPage(); }}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
        <div className="w-full sm:w-64">
          <DateRangePicker
            date={fecha}
            onDateChange={(d) => { setFecha(d); pagination.resetPage(); }}
            placeholder="Fecha de salida"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <XIcon className="size-4 mr-1" /> Limpiar
          </Button>
        )}
      </div>

      <DataTable
        columns={columnsWithActions}
        data={pagination.pageItems}
        emptyElement={
          <DataTableEmpty title="Sin resultados" description={hasFilters ? 'No se encontraron viajes con esos filtros.' : 'No hay viajes registrados.'} />
        }
      />

      {pagination.totalItems > 0 && (
        <div>
          <p className="text-xs text-muted-foreground px-4 pt-3 text-center sm:text-left">
            Mostrando {pagination.pageItems.length} de {pagination.totalItems} viajes
          </p>
          {pagination.totalPages > 1 && (
            <DataTablePagination
              pageIndex={pagination.pageIndex}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={pagination.goToPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
