'use client';

import { useMemo, useState } from 'react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { agenciasColumns } from './agencias-columns';
import { AgenciasFilters } from './agencias-filters';
import type { Agencia } from '@/infrastructure/domain/types';

interface AgenciasTableProps {
  data: Agencia[];
}

export function AgenciasTable({ data }: AgenciasTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter((a) =>
      a.razonSocial.toLowerCase().includes(lower) ||
      a.ruc.includes(lower)
    );
  }, [data, search]);

  return (
    <div className="space-y-4">
      <AgenciasFilters onSearch={setSearch} />
      <DataTable columns={agenciasColumns} data={filtered} />
    </div>
  );
}
