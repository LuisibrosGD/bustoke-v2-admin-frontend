'use client';

import React, { forwardRef, useState, useMemo } from 'react';
import {
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  Separator,
} from '@/components/ui';
import { CalendarIcon, Clock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
}

function parseDateTimeValue(value?: string) {
  if (!value || typeof value !== 'string') {
    return {
      selectedDate: undefined as Date | undefined,
      hours: '00',
      minutes: '00',
    };
  }

  let date: Date | undefined;
  let h = '00';
  let m = '00';

  if (value.includes('T') || (value.includes('-') && value.includes(':'))) {
    const parts = value.replace('T', ' ').split(' ');
    const [year, month, day] = parts[0].split('-');
    date = new Date(Number(year), Number(month) - 1, Number(day));

    if (parts[1]) {
      [h, m] = parts[1].split(':');
    }
  } else if (value.includes('/')) {
    const [datePart, timePart] = value.split(' ');
    const [day, month, year] = datePart.split('/');
    date = new Date(Number(year), Number(month) - 1, Number(day));

    if (timePart) {
      [h, m] = timePart.split(':');
    }
  }

  if (!date || isNaN(date.getTime())) {
    return {
      selectedDate: undefined as Date | undefined,
      hours: '00',
      minutes: '00',
    };
  }

  return {
    selectedDate: date,
    hours: h.slice(0, 2).padStart(2, '0'),
    minutes: m.slice(0, 2).padStart(2, '0'),
  };
}

export const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
  ({ value, onChange, disabled, placeholder, className, ...props }, ref) => {
    const [open, setOpen] = useState(false);

    const { selectedDate, hours, minutes } = useMemo(
      () => parseDateTimeValue(value),
      [value]
    );

    const emitChange = (nextValue: string) => {
      const syntheticEvent = {
        target: { value: nextValue },
        currentTarget: { value: nextValue },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange?.(syntheticEvent);
    };

    const updateDateTime = (date: Date | undefined, h: string, m: string) => {
      if (!date) {
        emitChange('');
        return;
      }

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const formatted = `${day}/${month}/${year} ${h}:${m}`;

      emitChange(formatted);
    };

    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        updateDateTime(date, hours, minutes);
      } else {
        updateDateTime(undefined, '00', '00');
      }
    };

    const handleTimeChange = (type: 'hours' | 'minutes', val: string) => {
      const numValue = parseInt(val, 10);
      const max = type === 'hours' ? 23 : 59;

      if (isNaN(numValue)) return;

      const clampedValue = Math.min(Math.max(0, numValue), max);
      const formattedValue = String(clampedValue).padStart(2, '0');

      if (type === 'hours') {
        updateDateTime(selectedDate, formattedValue, minutes);
      } else {
        updateDateTime(selectedDate, hours, formattedValue);
      }
    };

    const setNow = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      updateDateTime(now, h, m);
    };

    const clear = () => {
      updateDateTime(undefined, '00', '00');
    };

    const displayValue = (() => {
      if (!value) return '';
      if (value.includes('T')) {
        const parts = value.split('T');
        const [year, month, day] = parts[0].split('-');
        const time = parts[1]?.slice(0, 5) || '00:00';
        return `${day}/${month}/${year} ${time}`;
      }
      return value;
    })();

    return (
      <div className="relative w-full">
        <Popover open={open && !disabled} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal h-10 px-3 transition-all hover:bg-accent pr-9',
                !displayValue && 'text-muted-foreground',
                disabled && 'opacity-50 cursor-not-allowed',
                className
              )}
              onClick={() => !disabled && setOpen(true)}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
              <span className="flex-1 truncate">
                {displayValue || placeholder || 'Seleccionar fecha y hora'}
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Seleccionar fecha</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-primary"
                  onClick={setNow}
                >
                  Hoy
                </Button>
              </div>

              <Separator />

              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                captionLayout="dropdown"
                fromYear={2000}
                toYear={new Date().getFullYear() + 20}
                className="p-0"
              />

              <Separator />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 opacity-50" />
                  <span className="text-sm font-medium">Hora</span>
                </div>

                <div className="flex items-center gap-1 ml-auto">
                  <div className="flex flex-col gap-1 items-center">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={hours}
                      onChange={(e) => handleTimeChange('hours', e.target.value)}
                      className="w-12 h-9 text-center border rounded-md text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Hrs
                    </span>
                  </div>

                  <span className="mb-4 font-bold">:</span>

                  <div className="flex flex-col gap-1 items-center">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) => handleTimeChange('minutes', e.target.value)}
                      className="w-12 h-9 text-center border rounded-md text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {displayValue && !disabled && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-accent rounded-md transition-colors z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              clear();
            }}
          >
            <Trash2 className="h-3.5 w-3.5 opacity-40 hover:opacity-100 transition-opacity" />
          </button>
        )}

        <input type="hidden" ref={ref} value={value} {...props} />
      </div>
    );
  }
);

DateTimePicker.displayName = 'DateTimePicker';