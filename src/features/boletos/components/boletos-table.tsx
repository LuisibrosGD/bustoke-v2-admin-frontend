'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUserRole, useClientPagination } from '@/hooks';
import { Input, Spinner, Button } from '@/components/ui';
import { DateRangePicker } from '@/components/shared';
import { SearchIcon, Ticket, XIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination';
import { boletoRepository, pasajeroRepository, rutaRepository, viajeRepository } from '@/infrastructure/repositories';
import type { Boleto, Pasajero, Ruta, Viaje } from '@/infrastructure/domain/types';
import { useBoletosColumns } from './boletos-columns';
import { DataTableEmpty } from '@/components/ui/data-table/data-table-empty';

const selectClass = 'h-11 rounded-md border border-neutral-200 bg-neutral-50/50 px-3 text-sm focus:bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400';

export function BoletosTable() {
  const { role, idAgencia } = useUserRole();
  const [data, setData] = useState<Boleto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);

  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [fecha, setFecha] = useState<DateRange | undefined>();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = { limit: '500' };
        if (role === 'admin_agencia' && idAgencia) params.id_agencia = idAgencia;
        const result = await boletoRepository.list(params);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar boletos');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [role, idAgencia]);

  useEffect(() => {
    const base: Record<string, string> = { limit: '500' };
    if (role === 'admin_agencia' && idAgencia) base.id_agencia = idAgencia;
    pasajeroRepository.list(base).then(setPasajeros).catch(() => setPasajeros([]));
    viajeRepository.list(base).then(setViajes).catch(() => setViajes([]));
    rutaRepository.list(base).then(setRutas).catch(() => setRutas([]));
  }, [role, idAgencia]);

  const columns = useBoletosColumns(pasajeros, viajes, rutas);
  const viajesMap = useMemo(() => new Map(viajes.map((v) => [v.id, v])), [viajes]);

  const origenOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rutas) {
      const id = String(r.idTerminalOrigen ?? '');
      if (id && !map.has(id)) {
        map.set(id, r.terminalOrigenNombre ?? id);
      }
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rutas]);

  const destinoOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rutas) {
      if (origenId && String(r.idTerminalOrigen) !== origenId) continue;
      const id = String(r.idTerminalDestino ?? '');
      if (id && !map.has(id)) {
        map.set(id, r.terminalDestinoNombre ?? id);
      }
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rutas, origenId]);

  const rutaIdsFiltradas = useMemo(() => {
    if (!origenId && !destinoId) return null;
    const set = new Set<string>();
    for (const r of rutas) {
      if (origenId && String(r.idTerminalOrigen) !== origenId) continue;
      if (destinoId && String(r.idTerminalDestino) !== destinoId) continue;
      set.add(String(r.id));
    }
    return set;
  }, [rutas, origenId, destinoId]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const desde = fecha?.from ? new Date(fecha.from.getFullYear(), fecha.from.getMonth(), fecha.from.getDate()) : null;
    const hasta = fecha?.to ? new Date(fecha.to.getFullYear(), fecha.to.getMonth(), fecha.to.getDate(), 23, 59, 59) : null;

    return data.filter((b) => {
      if (term && !b.codigoQr.toLowerCase().includes(term)) return false;
      if (estado && b.estado !== estado) return false;

      const viaje = viajesMap.get(b.idViaje);
      if (rutaIdsFiltradas && (!viaje || !rutaIdsFiltradas.has(String(viaje.idRuta)))) return false;

      if (desde || hasta) {
        if (!viaje) return false;
        const salida = new Date(viaje.fechaHoraSalida);
        if (desde && salida < desde) return false;
        if (hasta && salida > hasta) return false;
      }
      return true;
    });
  }, [data, search, estado, rutaIdsFiltradas, fecha, viajesMap]);

  const pagination = useClientPagination(filtered, 15);

  const hasFilters = !!(search || estado || origenId || destinoId || fecha?.from);

  function clearFilters() {
    setSearch('');
    setEstado('');
    setOrigenId('');
    setDestinoId('');
    setFecha(undefined);
    pagination.resetPage();
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Error: {error}</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código QR..."
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
          <option value="activo">Activo</option>
          <option value="cancelado">Cancelado</option>
        </select>

        <select
          className={selectClass}
          value={origenId}
          onChange={(e) => { setOrigenId(e.target.value); setDestinoId(''); pagination.resetPage(); }}
        >
          <option value="">Origen (todos)</option>
          {origenOptions.map(([id, nombre]) => (
            <option key={id} value={id}>{nombre}</option>
          ))}
        </select>

        <select
          className={selectClass}
          value={destinoId}
          onChange={(e) => { setDestinoId(e.target.value); pagination.resetPage(); }}
        >
          <option value="">Destino (todos)</option>
          {destinoOptions.map(([id, nombre]) => (
            <option key={id} value={id}>{nombre}</option>
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
        columns={columns}
        data={pagination.pageItems}
        emptyElement={
          <DataTableEmpty
            icon={<Ticket className="size-8 text-muted-foreground" />}
            title="Sin boletos"
            description={hasFilters ? 'No se encontraron boletos con esos filtros.' : 'Aún no hay boletos emitidos.'}
          />
        }
      />

      {pagination.totalItems > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Mostrando {pagination.pageItems.length} de {pagination.totalItems} boletos
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
