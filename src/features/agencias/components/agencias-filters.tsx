'use client';

import { Input } from '@/components/ui';
import { useState } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui';

interface AgenciasFiltersProps {
  onSearch: (term: string) => void;
}

export function AgenciasFilters({ onSearch }: AgenciasFiltersProps) {
  const [term, setTerm] = useState('');

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por RUC o razón social..."
          className="pl-9"
          value={term}
          onChange={(e) => { setTerm(e.target.value); onSearch(e.target.value); }}
        />
      </div>
      {term && (
        <Button variant="ghost" size="sm" onClick={() => { setTerm(''); onSearch(''); }}>
          <XIcon className="size-4 mr-1" /> Limpiar
        </Button>
      )}
    </div>
  );
}
