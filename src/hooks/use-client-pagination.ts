'use client';

import { useMemo, useState } from 'react';

export interface UseClientPaginationResult<T> {
  pageItems: T[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  /** Cambia a una página (1-based, tal como emite DataTablePagination). */
  goToPage: (page1based: number) => void;
  /** Vuelve a la primera página; usar al cambiar filtros. */
  resetPage: () => void;
}

/**
 * Paginación del lado del cliente sobre un arreglo ya cargado en memoria.
 * Rebana los datos en páginas y expone justo lo que espera el componente
 * DataTablePagination. No usa efectos (evita el lint set-state-in-effect):
 * el índice de página se corrige de forma derivada si el arreglo se achica al
 * aplicar un filtro; para volver a la página 1 al cambiar filtros, el llamador
 * invoca resetPage() en el onChange del filtro.
 */
export function useClientPagination<T>(items: T[], pageSize = 15): UseClientPaginationResult<T> {
  const [pageIndex, setPageIndex] = useState(0);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeIndex = Math.min(pageIndex, totalPages - 1);

  const pageItems = useMemo(
    () => items.slice(safeIndex * pageSize, safeIndex * pageSize + pageSize),
    [items, safeIndex, pageSize]
  );

  return {
    pageItems,
    pageIndex: safeIndex,
    totalPages,
    totalItems,
    hasNextPage: safeIndex < totalPages - 1,
    hasPrevPage: safeIndex > 0,
    goToPage: (page1based: number) =>
      setPageIndex(Math.max(0, Math.min(page1based - 1, totalPages - 1))),
    resetPage: () => setPageIndex(0),
  };
}
