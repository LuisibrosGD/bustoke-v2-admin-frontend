'use client';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  Calendar,
} from '@/components/ui';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateRangePickerProps {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  placeholder?: string;
}

export function DateRangePicker({
  date,
  onDateChange,
  placeholder = 'Rango de fechas',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date-range"
          variant="outline"
          className="justify-start font-normal w-full h-11"
        >
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'dd LLL yyyy', { locale: es })} -{' '}
                {format(date.to, 'dd LLL yyyy', { locale: es })}
              </>
            ) : (
              format(date.from, 'dd LLL yyyy', { locale: es })
            )
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="range"
          selected={date}
          defaultMonth={date?.from}
          onSelect={onDateChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
