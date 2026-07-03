import { format, formatDistanceToNow, parse } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Normaliza una fecha a un objeto Date local, evitando desplazamientos de zona horaria para 'YYYY-MM-DD'.
 */
export function normalizeDate(date: string | Date | number): Date {
  if (typeof date === 'string') {
    const isoShort = /^\d{4}-\d{2}-\d{2}$/;
    if (isoShort.test(date)) {
      return parse(date, 'yyyy-MM-dd', new Date());
    }
  }
  return new Date(date);
}

/**
 * Formatear fecha en español
 */
export function formatDate(
  date: string | Date | number,
  formatStr: string = 'dd/MM/yyyy'
): string {
  const dateObj = normalizeDate(date);
  return format(dateObj, formatStr, { locale: es });
}

/**
 * Formatear fecha relativa en español
 */
export function formatRelativeTime(date: string | Date | number): string {
  const dateObj = normalizeDate(date);
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
}

/**
 * Formatear fecha completa en español
 */
export function formatFullDate(date: string | Date | number): string {
  return formatDate(date, "EEEE, d 'de' MMMM 'de' yyyy");
}

/**
 * Obtiene partes numéricas de una fecha.
 */
export const getDateParts = (
  data: string | Date
): { day: string; date: string; month: string } => {
  const endDate = normalizeDate(data);

  const day = String(endDate.getDate()).padStart(2, '0');
  const date = day;
  const month = String(endDate.getMonth() + 1).padStart(2, '0');

  return { day, date, month };
};

/**
 * Verifica si la fecha es hoy.
 */
export const isToday = (data: string | Date): boolean => {
  const target = normalizeDate(data);
  const current = normalizeDate(new Date());
  return target.toDateString() === current.toDateString();
};

/**
 * Verifica si la fecha es mañana.
 */
export const isTomorrow = (data: string | Date): boolean => {
  const target = normalizeDate(data);

  const tomorrow = normalizeDate(new Date());
  tomorrow.setDate(tomorrow.getDate() + 1);

  return target.toDateString() === tomorrow.toDateString();
};

/**
 * Verificar si la fecha ha expirado
 */
export const isDateExpired = (
  endDate: string | number | Date,
  currentDate?: string | number | Date
): boolean => {
  const endDateObj = normalizeDate(endDate);
  const currentDateObj = normalizeDate(currentDate || new Date());
  return endDateObj < currentDateObj;
};

/**
 * Formatear hora en formato de 12 horas con AM/PM
 */
export function formatTime(date: string | Date | number): string {
  return formatDate(date, 'h:mm a');
}

/**
 * Obtiene el estado de la fecha.
 */
export const getDateStatus = (data: string | Date) => ({
  isToday: isToday(data),
  isTomorrow: isTomorrow(data),
});
