'use client';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  Calendar,
} from '@/components/ui';

interface DatePickerSimpleProps {
  date?: Date | string;
  onDateChange?: (date: string | undefined) => void;
  formatDisplay?: 'es-ES' | 'en-US';
}

export function DatePickerSimple({
  date,
  onDateChange,
  formatDisplay = 'es-ES',
}: DatePickerSimpleProps) {
  const [open, setOpen] = useState(false);

  const dateValue =
    typeof date === 'string' && date
      ? (() => {
          const [year, month, day] = date.split('-');
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        })()
      : typeof date === 'string'
        ? undefined
        : date;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const isoString = `${year}-${month}-${day}`;
      onDateChange?.(isoString);
    } else {
      onDateChange?.(undefined);
    }
    setOpen(false);
  };

  const formatDate = (d: Date) => {
    if (formatDisplay === 'en-US') {
      const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      return formatter.format(d);
    }
    return d.toLocaleDateString('es-ES');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          className="justify-start font-normal w-full h-11"
        >
          {dateValue
            ? formatDate(dateValue)
            : formatDisplay === 'en-US'
              ? 'MMM DD, YYYY'
              : 'dd/mm/aaaa'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          defaultMonth={dateValue}
          captionLayout="dropdown"
          onSelect={handleDateSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
