'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building2, Map, Bus, MapPin, FileText, Users, Ticket, Loader2 } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui';
import { searchRepository } from '@/infrastructure/repositories';
import type { SearchCategory, SearchResultItem } from '@/infrastructure/domain/types';

const CATEGORY_META: Record<SearchCategory, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  agencias: { label: 'Agencias', icon: Building2 },
  viajes: { label: 'Viajes', icon: Map },
  buses: { label: 'Flota', icon: Bus },
  terminales: { label: 'Terminales', icon: MapPin },
  reclamos: { label: 'Reclamos', icon: FileText },
  pasajeros: { label: 'Pasajeros', icon: Users },
  boletos: { label: 'Boletos', icon: Ticket },
};

const CATEGORY_ORDER: SearchCategory[] = ['viajes', 'boletos', 'pasajeros', 'agencias', 'buses', 'terminales', 'reclamos'];

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Partial<Record<SearchCategory, SearchResultItem[]>>>({});
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => {
      setLoading(true);
      searchRepository.search(trimmed, controller.signal)
        .then((res) => setResults(res.results))
        .catch((e) => { if (e?.name !== 'AbortError') setResults({}); })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query, open]);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery('');
      setResults({});
    }
  }, []);

  const handleSelect = useCallback((item: SearchResultItem) => {
    handleOpenChange(false);
    router.push(item.url);
  }, [handleOpenChange, router]);

  const trimmedQuery = query.trim();
  const showResults = trimmedQuery.length >= 2;
  const hasResults = showResults && Object.values(results).some((items) => items && items.length > 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex-1 max-w-md h-9 flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-400 hover:bg-white hover:border-neutral-300 transition-colors"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left">Buscar...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-400">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Buscar"
        description="Busca viajes, boletos, pasajeros, agencias, buses, terminales o reclamos"
        shouldFilter={false}
      >
        <CommandInput
          placeholder="Buscar viajes, boletos, pasajeros, agencias..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {trimmedQuery.length > 0 && trimmedQuery.length < 2 && (
            <CommandEmpty>Escribe al menos 2 caracteres.</CommandEmpty>
          )}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Buscando...
            </div>
          )}
          {!loading && trimmedQuery.length >= 2 && !hasResults && (
            <CommandEmpty>No se encontraron resultados para &quot;{trimmedQuery}&quot;.</CommandEmpty>
          )}
          {!loading && showResults && CATEGORY_ORDER.map((category) => {
            const items = results[category];
            if (!items || items.length === 0) return null;
            const { label, icon: Icon } = CATEGORY_META[category];
            return (
              <CommandGroup key={category} heading={label}>
                {items.map((item) => (
                  <CommandItem
                    key={`${category}-${item.id}`}
                    value={`${category}-${item.id}-${item.title}`}
                    onSelect={() => handleSelect(item)}
                  >
                    <Icon className="size-4" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{item.title}</span>
                      <span className="text-xs text-muted-foreground truncate">{item.subtitle}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
