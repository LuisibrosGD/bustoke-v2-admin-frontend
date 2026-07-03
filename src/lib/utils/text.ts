export function getInitials(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') return '';

  return fullName
    .trim()
    .split(/\s+/) // divide por espacios múltiples
    .filter(Boolean) // limpia posibles vacíos
    .map((word) => word[0].toUpperCase()) // toma inicial
    .filter((char) => /[A-ZÁÉÍÓÚÜÑ]/i.test(char)) // ignora símbolos
    .reduce((acc, char, index, arr) => {
      // tomar solo la primera y última inicial
      if (index === 0 || index === arr.length - 1) {
        acc += char.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // quitar acentos
      }
      return acc;
    }, '');
}

/**
 * Enmascara un texto mostrando solo los primeros y últimos caracteres.
 * Útil para números de cuenta, tarjetas, correos, etc.
 * maskText("1234567890123456") // "************3456"
 * maskText("1234567890123456", { showStart: 4, showEnd: 4 }) // "1234********3456"
 * maskText("1234567890123456", { showStart: 0, showEnd: 0 }) // "************"
 * maskText("1234567890123456", { maskChar: "#" }) // "############3456"
 */
export function maskText(
  value: string,
  {
    showStart = 0,
    showEnd = 4,
    maskChar = '*',
  }: {
    showStart?: number;
    showEnd?: number;
    maskChar?: string;
  } = {}
): string {
  if (!value) return value;

  const length = value.length;
  const visibleChars = showStart + showEnd;

  if (visibleChars >= length) return value;

  const start = value.slice(0, showStart);
  const end = value.slice(length - showEnd);
  const masked = maskChar.repeat(length - visibleChars);

  return `${start}${masked}${end}`;
}

export function formatCurrency(
  amount: number,
  currency: 'PEN' | 'USD'
): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return '-';
  }

  const currencySymbol = currency === 'PEN' ? 'S/' : '$';
  return `${currencySymbol} ${amount.toFixed(2)}`;
}

/**
 * Capitaliza un texto en formato ENUM (mayúsculas con guiones bajos)
 * Ejemplo: "PENDING_PHOTO" -> "Pending Photo"
 */
export function formatEnumLabel(value: string | undefined): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
