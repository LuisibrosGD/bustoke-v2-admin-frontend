'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUserRole } from '@/hooks';
import { Input, Spinner } from '@/components/ui';
import { SearchIcon, Ticket } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { boletoRepository, pasajeroRepository, viajeRepository } from '@/infrastructure/repositories';
import type { Boleto, Pasajero, Viaje } from '@/infrastructure/domain/types';
import { useBoletosColumns } from './boletos-columns';
import { DataTableEmpty } from '@/components/ui/data-table/data-table-empty';

export function BoletosTable() {
  const { role, idAgencia } = useUserRole();
  const [data, setData] = useState<Boleto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [s, setS] = useState('');
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  const [viajes, setViajes] = useState<Viaje[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const params = role === 'admin_agencia' && idAgencia ? { id_agencia: idAgencia } : undefined;
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
    pasajeroRepository.list().then(setPasajeros).catch(() => setPasajeros([]));
    viajeRepository.list().then(setViajes).catch(() => setViajes([]));
  }, []);

  const columns = useBoletosColumns(pasajeros, viajes);

  const f = useMemo(() => {
    if (!s) return data;
    const l = s.toLowerCase();
    return data.filter((b) => b.codigoQr.toLowerCase().includes(l));
  }, [data, s]);

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
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar boleto..." className="pl-9" value={s} onChange={(e) => setS(e.target.value)} />
      </div>
      <DataTable
        columns={columns}
        data={f}
        emptyElement={
          <DataTableEmpty
            icon={<Ticket className="size-8 text-muted-foreground" />}
            title="Sin boletos"
            description={s ? 'No se encontraron boletos con ese criterio de búsqueda.' : 'Aún no hay boletos emitidos.'}
          />
        }
      />
    </div>
  );
}
