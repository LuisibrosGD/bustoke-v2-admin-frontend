'use client';

import { GlobalCombobox, GlobalComboboxMultiple } from '@/components/shared';
import { Button, Input } from '@/components/ui';
import { PATHS } from '@/lib/constants/paths';
import { SearchIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ReportQuery } from '../domain';
import {
  REPORT_FILTER_KEYS_BY_SLUG,
  REPORT_FILTERS,
  ReportFilterKey,
} from './report-filter-config';
import { ReportCheckboxFilter } from './report-checkbox-filter';
import { ReportRutaMultiFilter } from './report-ruta-multi-filter';
import { busRepository, rutaRepository } from '@/infrastructure/repositories';
import type { ComboboxOption } from '@/types/common.types';
import type { Ruta } from '@/infrastructure/domain/types';

// Claves cuyo valor se maneja como arreglo (aunque en la URL viaje como
// string separado por comas): comparten el mismo parseo inicial sin
// importar con qué widget se rendericen.
const ARRAY_VALUE_KEYS: ReportFilterKey[] = ['rutaId', 'busId', 'estadoPago', 'metodoPago', 'canalVenta', 'estadoViaje'];

// Diseño Propuesto 2: lista de checkboxes siempre visible, sin reabrir el
// dropdown por cada opción.
const CHECKBOX_FILTER_KEYS: ReportFilterKey[] = ['estadoPago', 'metodoPago', 'estadoViaje', 'busId'];

// Diseño Propuesto 1 (selector de ruta por pares origen→destino): solo en
// los reportes donde el documento lo pidió explícitamente.
const RUTA_MULTI_FILTER_SLUGS = new Set(['ventas', 'viajes']);

interface ReportFiltersProps {
  query: ReportQuery;
  slug: string;
  isSuperAdmin?: boolean;
  userAgenciaId?: string;
}

export function ReportFilters({ query, slug, isSuperAdmin = false, userAgenciaId }: ReportFiltersProps) {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [busOptions, setBusOptions] = useState<ComboboxOption[]>([]);

  useEffect(() => {
    if (!userAgenciaId) return;
    rutaRepository.findByAgencia(userAgenciaId)
      .then(setRutas)
      .catch(() => setRutas([]));
  }, [userAgenciaId]);

  useEffect(() => {
    if (!userAgenciaId) return;
    busRepository.findByAgencia(userAgenciaId)
      .then((buses) => {
        setBusOptions(
          buses.map((b) => ({ value: String(b.id), label: b.placa }))
        );
      })
      .catch(() => setBusOptions([]));
  }, [userAgenciaId]);

  const rutaOptions = useMemo(
    () =>
      rutas.map((r) => ({
        value: String(r.id),
        label: [r.terminalOrigenNombre, r.terminalDestinoNombre].filter(Boolean).join(' → ') || `Ruta ${r.id}`,
      })),
    [rutas]
  );

  const filterKeys = (REPORT_FILTER_KEYS_BY_SLUG[slug] ?? []).filter(
    (key) => key !== 'agenciaId' || isSuperAdmin
  );

  const [comboboxValues, setComboboxValues] = useState<
    Partial<Record<ReportFilterKey, string | string[]>>
  >(() =>
    filterKeys.reduce<Partial<Record<ReportFilterKey, string | string[]>>>((acc, key) => {
      const raw = query[key];
      if (ARRAY_VALUE_KEYS.includes(key)) {
        acc[key] = raw ? raw.split(',').filter(Boolean) : [];
      } else {
        acc[key] = raw ?? '';
      }
      return acc;
    }, {})
  );

  return (
    <form
      action={PATHS.reportDetailPage(slug)}
      method="get"
      className="rounded-lg border bg-card p-4 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <label className="space-y-1.5 text-sm font-medium">
          <span className="block">Desde</span>
          <Input type="date" name="from" defaultValue={query.from} />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          <span className="block">Hasta</span>
          <Input type="date" name="to" defaultValue={query.to} />
        </label>
        {filterKeys.map((key) => {
          const filter = REPORT_FILTERS[key];
          const currentValue = comboboxValues[key];
          const currentArray = Array.isArray(currentValue) ? currentValue : [];

          if (key === 'rutaId' && RUTA_MULTI_FILTER_SLUGS.has(slug)) {
            return (
              <div key={key} className="space-y-1.5 text-sm font-medium sm:col-span-2 lg:col-span-3">
                <label className="block">{filter.label}</label>
                <ReportRutaMultiFilter
                  rutas={rutas}
                  value={currentArray}
                  onChange={(val) => setComboboxValues((current) => ({ ...current, [key]: val }))}
                />
                <input type="hidden" name={filter.key} value={currentArray.join(',')} />
              </div>
            );
          }

          if (CHECKBOX_FILTER_KEYS.includes(key)) {
            const options = key === 'busId' ? busOptions : filter.options ?? [];
            return (
              <div key={key} className="space-y-1.5 text-sm font-medium">
                <label htmlFor={`report-filter-${key}`} className="block">
                  {filter.label}
                </label>
                <ReportCheckboxFilter
                  id={`report-filter-${key}`}
                  options={options}
                  value={currentArray}
                  onChange={(val) => setComboboxValues((current) => ({ ...current, [key]: val }))}
                />
                <input type="hidden" name={filter.key} value={currentArray.join(',')} />
              </div>
            );
          }

          const options = key === 'rutaId' && rutaOptions.length > 0 ? rutaOptions : filter.options ?? [];
          const isMulti = ARRAY_VALUE_KEYS.includes(key);

          if (isMulti && options) {
            return (
              <div key={key} className="space-y-1.5 text-sm font-medium">
                <label htmlFor={`report-filter-${key}`} className="block">
                  {filter.label}
                </label>
                <GlobalComboboxMultiple
                  id={`report-filter-${key}`}
                  key={key === 'rutaId' ? `rutaId-${rutaOptions.length}` : key}
                  items={options}
                  value={currentArray}
                  onChange={(val) =>
                    setComboboxValues((current) => ({
                      ...current,
                      [key]: val,
                    }))
                  }
                />
                <input
                  type="hidden"
                  name={filter.key}
                  value={currentArray.join(',')}
                />
              </div>
            );
          }

          return (
            <div key={key} className="space-y-1.5 text-sm font-medium">
              <label htmlFor={`report-filter-${key}`} className="block">
                {filter.label}
              </label>
              {options ? (
                <>
                  <GlobalCombobox
                    id={`report-filter-${key}`}
                    items={options}
                    value={typeof currentValue === 'string' ? currentValue : ''}
                    onChange={(value) =>
                      setComboboxValues((current) => ({
                        ...current,
                        [key]: value,
                      }))
                    }
                />
                  <input
                    type="hidden"
                    name={filter.key}
                    value={typeof currentValue === 'string' ? currentValue : ''}
                  />
                </>
              ) : (
                <Input
                  id={`report-filter-${key}`}
                  name={filter.key}
                  defaultValue={typeof currentValue === 'string' ? currentValue : query[filter.key]}
                  placeholder={filter.placeholder}
                />
              )}
            </div>
          );
        })}
        <label className="space-y-1.5 text-sm font-medium">
          <span className="block">Filas por página</span>
          <select
            name="limit"
            defaultValue={query.limit ?? '30'}
            className="border-input bg-background h-11 w-full rounded-md border px-[14px] py-[10px] text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="10">10</option>
            <option value="30">30</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </label>
      </div>
      <input type="hidden" name="page" value="1" />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit">
          <SearchIcon className="size-4" />
          Aplicar filtros
        </Button>
        <Button asChild type="button" variant="outline">
          <Link href={PATHS.reportDetailPage(slug)}>
            <XIcon className="size-4" />
            Limpiar
          </Link>
        </Button>
      </div>
    </form>
  );
}
