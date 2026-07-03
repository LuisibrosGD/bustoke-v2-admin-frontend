'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface BlockMessageErrorPageProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function BlockMessageErrorPage({
  title = 'Tuvimos un problema al cargar esta página',
  description = 'No pudimos mostrar la información en ese momento. Por favor, intenta recargar la página o vuelve a intentarlo en unos minutos.',
  onRetry,
  retryLabel = 'Reintentar',
  className,
}: BlockMessageErrorPageProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-6 py-12 max-w-90 mx-auto',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="p-3 bg-yellow-50 rounded-full">
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="font-semibold">{title}</h2>
          <p
            className="text-sm text-muted-foreground"
            style={{ lineHeight: '1.5' }}
          >
            {description}
          </p>
        </div>
      </div>

      {onRetry && (
        <Button type="button" onClick={onRetry} className="w-full">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
