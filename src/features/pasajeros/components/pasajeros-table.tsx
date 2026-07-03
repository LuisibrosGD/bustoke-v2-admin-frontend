'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUserRole } from '@/hooks';
import { Input, Spinner } from '@/components/ui';
import { SearchIcon, User } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { pasajeroRepository } from '@/infrastructure/repositories';
import type { Pasajero } from '@/infrastructure/domain/types';
import { pasajerosColumns } from './pasajeros-columns';
import { DataTableEmpty } from '@/components/ui/data-table/data-table-empty';

export function PasajerosTable({ viajeId }: { viajeId?: string }) {
  const { role, idAgencia } = useUserRole();
  const [data, setData] = useState<Pasajero[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [s, setS] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        let result: Pasajero[];
        if (viajeId) {
          result = await pasajeroRepository.getByViaje(viajeId);
        } else {
          const params = role === 'admin_agencia' && idAgencia ? { id_agencia: idAgencia } : undefined;
          result = await pasajeroRepository.list(params);
        }
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar pasajeros');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [role, idAgencia, viajeId]);

  const f = useMemo(() => {
    if (!s) return data;
    const l = s.toLowerCase();
    return data.filter(
      (p) =>
        p.nombres.toLowerCase().includes(l) ||
        p.apellidoPaterno.toLowerCase().includes(l) ||
        p.numeroDocumento.toLowerCase().includes(l)
    );
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
        <Input placeholder="Buscar pasajero..." className="pl-9" value={s} onChange={(e) => setS(e.target.value)} />
      </div>
      <DataTable
        columns={pasajerosColumns}
        data={f}
        emptyElement={
          <DataTableEmpty
            icon={<User className="size-8 text-muted-foreground" />}
            title="Sin pasajeros"
            description={s ? 'No se encontraron pasajeros con ese criterio de búsqueda.' : 'Aún no hay pasajeros registrados.'}
          />
        }
      />
    </div>
  );
}
