'use client';

import * as React from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface PriceInputProps extends Omit<
  React.ComponentProps<'input'>,
  'type'
> {
  currency?: string;
}

// Adds thousand separators preserving the decimal part: "1234567.89" → "1,234,567.89"
function addThousands(raw: string): string {
  if (!raw) return '';
  const [intPart, decPart] = raw.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

// Converts raw numeric string to 2-decimal display string with thousand separators
function toFormatted(raw: string): string {
  const num = parseFloat(raw);
  if (isNaN(num)) return '';
  return addThousands(num.toFixed(2));
}

// Counts non-comma characters up to displayPos in a formatted string
function displayToRawCursor(displayPos: number, displayStr: string): number {
  let raw = 0;
  for (let i = 0; i < displayPos && i < displayStr.length; i++) {
    if (displayStr[i] !== ',') raw++;
  }
  return raw;
}

// Finds the display index of the rawPos-th non-comma character
function rawToDisplayCursor(rawPos: number, displayStr: string): number {
  let rawCount = 0;
  for (let i = 0; i < displayStr.length; i++) {
    if (displayStr[i] !== ',') {
      rawCount++;
      if (rawCount === rawPos) return i + 1;
    }
  }
  return displayStr.length;
}

const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
  (
    { value, onChange, onBlur, onFocus, currency = 'S/.', className, ...props },
    ref
  ) => {
    const localRef = React.useRef<HTMLInputElement>(null);
    const isFocusedRef = React.useRef(false);

    const mergedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        (localRef as React.MutableRefObject<HTMLInputElement | null>).current =
          node;
        if (typeof ref === 'function') ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            node;
      },
      [ref]
    );

    const parseExternal = (
      val: string | number | readonly string[] | undefined
    ): string => {
      const str = val !== undefined && val !== null ? String(val) : '';
      if (!str) return '';
      const num = parseFloat(str);
      return isNaN(num) ? '' : num.toFixed(2);
    };

    // rawValue: plain numeric string like "1234.56"
    // display:  formatted string like "1,234.56"
    const [rawValue, setRawValue] = React.useState(() => parseExternal(value));
    const [display, setDisplay] = React.useState(() =>
      addThousands(parseExternal(value))
    );

    React.useEffect(() => {
      if (!isFocusedRef.current) {
        const raw = parseExternal(value);
        setRawValue(raw);
        setDisplay(raw ? addThousands(raw) : '');
      }
    }, [value]);

    const emitChange = (raw: string) => {
      if (!onChange) return;
      onChange({
        target: { value: raw },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = true;
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = false;
      const formatted = toFormatted(rawValue);
      const raw = formatted
        ? parseFloat(formatted.replace(/,/g, '')).toFixed(2)
        : '';
      setRawValue(raw);
      setDisplay(formatted);
      emitChange(raw);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const el = e.target;
      const cursorPos = el.selectionStart ?? 0;

      // Strip thousand separators from whatever the browser produced
      const stripped = el.value.replace(/,/g, '');

      // Reject invalid patterns (only digits + one dot + max 2 decimals)
      if (stripped !== '' && !/^\d*\.?\d{0,2}$/.test(stripped)) return;

      const newDisplay = addThousands(stripped);

      // Map cursor from the browser's value (with commas) to the new formatted value
      const rawCursor = displayToRawCursor(cursorPos, el.value);
      const newCursor = rawToDisplayCursor(rawCursor, newDisplay);

      setRawValue(stripped);
      setDisplay(newDisplay);
      emitChange(stripped);

      requestAnimationFrame(() => {
        localRef.current?.setSelectionRange(newCursor, newCursor);
      });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.ctrlKey || e.metaKey) return;
      if (
        [
          'Backspace',
          'Delete',
          'Tab',
          'Escape',
          'Enter',
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'Home',
          'End',
        ].includes(e.key)
      )
        return;
      if (e.key === '.') {
        if (rawValue.includes('.')) e.preventDefault();
        return;
      }
      if (!/^\d$/.test(e.key)) e.preventDefault();
    };

    return (
      <InputGroup className={cn(className)}>
        <InputGroupAddon align="inline-start">{currency}</InputGroupAddon>
        <InputGroupInput
          ref={mergedRef}
          inputMode="decimal"
          placeholder="0.00"
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          {...props}
        />
      </InputGroup>
    );
  }
);

PriceInput.displayName = 'PriceInput';

export { PriceInput };
