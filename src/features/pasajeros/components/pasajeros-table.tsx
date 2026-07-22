'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUserRole, useClientPagination } from '@/hooks';
import { Input, Spinner, Button } from '@/components/ui';
import { SearchIcon, Star, User } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination';
import { pasajeroRepository, boletoRepository } from '@/infrastructure/repositories';
import type { Pasajero } from '@/infrastructure/domain/types';
import { usePasajerosColumns, CLIENTE_FRECUENTE_MIN_BOLETOS } from './pasajeros-columns';
import { DataTableEmpty } from '@/components/ui/data-table/data-table-empty';

export function PasajerosTable({ viajeId }: { viajeId?: string }) {
  const { role, idAgencia } = useUserRole();
  const [data, setData] = useState<Pasajero[]>([]);
  const [boletosPorPasajero, setBoletosPorPasajero] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [s, setS] = useState('');
  const [soloFrecuentes, setSoloFrecuentes] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = { limit: '500' };
        if (role === 'admin_agencia' && idAgencia) params.id_agencia = idAgencia;

        const [result, boletos] = await Promise.all([
          viajeId ? pasajeroRepository.getByViaje(viajeId) : pasajeroRepository.list(params),
          boletoRepository.list(params).catch(() => []),
        ]);
        if (cancelled) return;
        setData(result);
        const conteo = new Map<string, number>();
        for (const b of boletos) {
          conteo.set(b.idPasajero, (conteo.get(b.idPasajero) ?? 0) + 1);
        }
        setBoletosPorPasajero(conteo);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar pasajeros');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [role, idAgencia, viajeId]);

  const columns = usePasajerosColumns(boletosPorPasajero);

  const f = useMemo(() => {
    const l = s.toLowerCase();
    return data.filter((p) => {
      if (soloFrecuentes && (boletosPorPasajero.get(p.id) ?? 0) < CLIENTE_FRECUENTE_MIN_BOLETOS) return false;
      if (!l) return true;
      return (
        p.nombres.toLowerCase().includes(l) ||
        p.apellidoPaterno.toLowerCase().includes(l) ||
        p.numeroDocumento.toLowerCase().includes(l)
      );
    });
  }, [data, s, soloFrecuentes, boletosPorPasajero]);

  const pagination = useClientPagination(f, 15);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar pasajero..." className="pl-9" value={s} onChange={(e) => { setS(e.target.value); pagination.resetPage(); }} />
        </div>
        <Button
          type="button"
          variant={soloFrecuentes ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setSoloFrecuentes((v) => !v); pagination.resetPage(); }}
        >
          <Star className="size-3.5" />
          Solo clientes frecuentes
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={pagination.pageItems}
        emptyElement={
          <DataTableEmpty
            icon={<User className="size-8 text-muted-foreground" />}
            title="Sin pasajeros"
            description={
              soloFrecuentes
                ? 'No hay clientes frecuentes con los filtros actuales.'
                : s
                  ? 'No se encontraron pasajeros con ese criterio de búsqueda.'
                  : 'Aún no hay pasajeros registrados.'
            }
          />
        }
      />
      {pagination.totalItems > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Mostrando {pagination.pageItems.length} de {pagination.totalItems} pasajeros
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
