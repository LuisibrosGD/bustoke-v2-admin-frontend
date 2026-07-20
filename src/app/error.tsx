'use client';

import { useEffect } from 'react';
import { ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-50 text-red-500">
        <ServerCrash className="size-8" />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Ocurrió un error inesperado</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Intenta nuevamente en unos momentos. Si el problema persiste, contacta a soporte técnico.
        </p>
      </div>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
