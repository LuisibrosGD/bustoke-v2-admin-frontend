export function getReportColumnClass(column: string): string {
  if (column.includes('DESCRIPCIÓN LARGA')) {
    return 'min-w-64';
  }

  if (
    column.includes('DESCRIPCIÓN') ||
    column.includes('MODALIDAD') ||
    column.includes('LIQUIDACIÓN') ||
    column.includes('OBSERVACIÓN') ||
    column.includes('DESTINO')
  ) {
    return 'min-w-52';
  }

  if (
    column.includes('FECHA') ||
    column.includes('CATEGORÍA') ||
    column.includes('CONVERSIÓN') ||
    column.includes('PROMEDIO') ||
    column.includes('ARTÍCULOS') ||
    column.includes('ARTICULOS')
  ) {
    return 'min-w-44';
  }

  return 'min-w-36';
}

export function formatReportCell(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  return String(value);
}
