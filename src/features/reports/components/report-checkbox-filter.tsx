'use client';

import type { ComboboxOption } from '@/types/common.types';

interface ReportCheckboxFilterProps {
  id?: string;
  options: ComboboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * Lista de checkboxes siempre visible (sin reabrir ningún dropdown) con un
 * checkbox "Todo" que selecciona/deselecciona todas las opciones a la vez.
 */
export function ReportCheckboxFilter({ id, options, value, onChange }: ReportCheckboxFilterProps) {
  const allSelected = options.length > 0 && value.length === options.length;

  function toggleAll() {
    onChange(allSelected ? [] : options.map((o) => o.value));
  }

  function toggleOne(val: string) {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  }

  return (
    <div id={id} className="max-h-56 divide-y overflow-y-auto rounded-md border border-neutral-200">
      <label className="flex cursor-pointer items-center gap-2 p-2 text-sm font-medium">
        <input type="checkbox" checked={allSelected} onChange={toggleAll} />
        Todo
      </label>
      {options.map((opt) => (
        <label key={opt.value} className="flex cursor-pointer items-center gap-2 p-2 text-sm">
          <input
            type="checkbox"
            checked={value.includes(opt.value)}
            onChange={() => toggleOne(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
