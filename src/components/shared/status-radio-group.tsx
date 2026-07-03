'use client';

import { cn } from '@/lib/utils';

interface StatusOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StatusRadioGroupProps {
  options: StatusOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  name?: string;
}

export function StatusRadioGroup({
  options,
  value,
  onValueChange,
  className,
  name = 'status',
}: StatusRadioGroupProps) {
  return (
    <div className={className}>
      <fieldset className="space-y-3">
        {options.map((option) => (
          <label
            key={option.id}
            className={cn(
              'flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all',
              value === option.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/50'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={(e) => onValueChange(e.target.value)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-foreground block">
                {option.label}
              </span>
              {option.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {option.description}
                </p>
              )}
            </div>
            {option.icon && <div className="shrink-0">{option.icon}</div>}
          </label>
        ))}
      </fieldset>
    </div>
  );
}
