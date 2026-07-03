'use client';

import { PlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui';

interface AddCardProps {
  title?: string;
  onClick: () => void;
  className?: string;
}

export function AddCard({
  title = 'Agregar',
  onClick,
  className,
}: AddCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Button
        onClick={onClick}
        type="button"
        size="icon-lg"
        variant="outline"
        className={cn(
          'border-primary-50 border-6 size-10 bg-primary-100 rounded-full',
          className
        )}
      >
        <PlusIcon className="size-5 text-primary" />
      </Button>
      <span className="text-sm text-primary-600 font-semibold">{title}</span>
    </div>
  );
}
