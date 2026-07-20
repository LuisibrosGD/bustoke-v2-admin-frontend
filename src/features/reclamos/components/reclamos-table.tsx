'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui';
import { SearchIcon } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTableEmpty } from '@/components/ui/data-table/data-table-empty';
import { useReclamosColumns } from './reclamos-columns';
import type { Reclamo } from '@/infrastructure/domain/types';

interface Props { data: Reclamo[]; onRefresh: () => void }

export function ReclamosTable({ data, onRefresh }: Props) {
  const [s, setS] = useState('');
  const columns = useReclamosColumns(onRefresh);
  const f = useMemo(() => {
    if (!s) return data;
    const l = s.toLowerCase();
    return data.filter((r) => r.motivo.toLowerCase().includes(l) || r.detalle.toLowerCase().includes(l));
  }, [data, s]);
  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar reclamo..." className="pl-9" value={s} onChange={(e) => setS(e.target.value)} />
      </div>
      <DataTable
        columns={columns}
        data={f}
        emptyElement={<DataTableEmpty title="Sin resultados" description="No se encontraron reclamos." />}
      />
    </div>
  );
}
