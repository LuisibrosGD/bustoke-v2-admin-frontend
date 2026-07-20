'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui';
import { SearchIcon } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTableEmpty } from '@/components/ui/data-table/data-table-empty';
import { useSuscripcionesColumns } from './suscripciones-columns';
import { agenciaRepository, planRepository } from '@/infrastructure/repositories';
import type { Agencia, Plan, Suscripcion } from '@/infrastructure/domain/types';

interface Props { data: Suscripcion[] }

export function SuscripcionesTable({ data }: Props) {
  const [s, setS] = useState('');
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);

  useEffect(() => {
    agenciaRepository.list().then(setAgencias).catch(() => setAgencias([]));
    planRepository.list().then(setPlanes).catch(() => setPlanes([]));
  }, []);

  const columns = useSuscripcionesColumns(agencias, planes);

  const f = useMemo(() => {
    if (!s) return data;
    const l = s.toLowerCase();
    return data.filter((x) => String(x.idPlan).includes(l) || x.estadoCobro.includes(l) || String(x.idAgencia).includes(l));
  }, [data, s]);
  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar suscripción..." className="pl-9" value={s} onChange={(e) => setS(e.target.value)} />
      </div>
      <DataTable
        columns={columns}
        data={f}
        emptyElement={<DataTableEmpty title="Sin resultados" description="No se encontraron suscripciones." />}
      />
    </div>
  );
}
