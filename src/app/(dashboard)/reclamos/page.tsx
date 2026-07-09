'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserRole } from '@/hooks';
import { ReclamosTable } from '@/features/reclamos/components';
import { reclamoRepository } from '@/infrastructure/repositories';
import type { Reclamo } from '@/infrastructure/domain/types';

export default function ReclamosPage() {
  const { role, idAgencia } = useUserRole();

  const [data, setData] = useState<Reclamo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    const params = role === 'admin_agencia' && idAgencia ? { id_agencia: idAgencia } : undefined;
    return reclamoRepository.list(params)
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setIsLoading(false));
  }, [role, idAgencia]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function load() {
    setIsLoading(true);
    fetchData();
  }

  if (isLoading) return <div className="p-6 text-muted-foreground">Cargando reclamos...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Reclamos y Quejas</h1>
        <p className="mt-2 text-muted-foreground">
          Libro de reclamaciones digital.
        </p>
      </div>
      <ReclamosTable data={data} onRefresh={load} />
    </div>
  );
}
