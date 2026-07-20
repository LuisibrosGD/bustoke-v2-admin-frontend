'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserRole } from '@/hooks';
import { SoporteTable } from '@/features/soporte/components';
import { soporteRepository } from '@/infrastructure/repositories';
import type { TicketSoporte } from '@/infrastructure/domain/types';

export default function SoportePage() {
  const { role, idAgencia } = useUserRole();

  const [data, setData] = useState<TicketSoporte[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    const params = role === 'admin_agencia' && idAgencia ? { id_agencia: idAgencia } : undefined;
    return soporteRepository.list(params)
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setIsLoading(false));
  }, [role, idAgencia]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const load = () => {
    setIsLoading(true);
    fetchData();
  };

  if (isLoading) return <div className="p-6 text-muted-foreground">Cargando tickets...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Soporte</h1>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          Tickets de soporte técnico.
        </p>
      </div>
      <SoporteTable data={data} onRefresh={load} />
    </div>
  );
}
