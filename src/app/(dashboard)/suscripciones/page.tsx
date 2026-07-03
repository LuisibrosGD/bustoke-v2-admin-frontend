'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserRole } from '@/hooks';
import { SuscripcionesTable } from '@/features/suscripciones/components';
import { suscripcionRepository } from '@/infrastructure/repositories';
import { Button } from '@/components/ui';
import { Settings } from 'lucide-react';
import type { Suscripcion } from '@/infrastructure/domain/types';

export default function SuscripcionesPage() {
  const { idAgencia } = useUserRole();
  const [data, setData] = useState<Suscripcion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = idAgencia ? { id_agencia: idAgencia } : undefined;
    setIsLoading(true);
    suscripcionRepository.list(params)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setIsLoading(false));
  }, [idAgencia]);

  if (isLoading) return <div className="p-6 text-muted-foreground">Cargando suscripciones...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Suscripciones</h1>
          <p className="mt-2 text-muted-foreground">
            Planes SaaS contratados por las agencias.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/suscripciones/planes">
            <Settings className="size-4" />
            Gestionar Planes
          </Link>
        </Button>
      </div>
      <SuscripcionesTable data={data} />
    </div>
  );
}
