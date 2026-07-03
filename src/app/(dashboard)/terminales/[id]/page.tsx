'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button/button';
import { ArrowLeft, MapPin, Building2 } from 'lucide-react';
import { terminalRepository, ubigeoRepository } from '@/infrastructure/repositories';
import type { Terminal, Distrito, Provincia, Departamento } from '@/infrastructure/domain/types';

function InfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
      <span className="text-sm font-medium text-neutral-500 min-w-[140px]">{label}</span>
      <div className="text-sm text-neutral-900">{value}</div>
    </div>
  );
}

export default function TerminalDetailPage() {
  const params = useParams<{ id: string }>();
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [distrito, setDistrito] = useState<Distrito | null>(null);
  const [provincia, setProvincia] = useState<Provincia | null>(null);
  const [departamento, setDepartamento] = useState<Departamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [t, provincias, distritos, deps] = await Promise.all([
          terminalRepository.getById(params.id),
          ubigeoRepository.getProvincias(),
          ubigeoRepository.getDistritos(),
          ubigeoRepository.getDepartamentos(),
        ]);
        if (!t) { setLoading(false); return; }
        setTerminal(t);
        const d = distritos.find((x) => String(x.id) === String(t.idDistrito));
        if (d) {
          setDistrito(d);
          const p = provincias.find((x) => String(x.id) === String(d.idProvincia));
          if (p) {
            setProvincia(p);
            const dep = deps.find((x) => String(x.id) === String(p.idDepartamento));
            if (dep) setDepartamento(dep);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) {
    return <div className="p-6 text-muted-foreground">Cargando terminal...</div>;
  }

  if (error || !terminal) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-medium text-neutral-900">Terminal no encontrado</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/terminales"><ArrowLeft className="size-4 mr-1" /> Volver a terminales</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-sm" asChild>
            <Link href="/terminales"><ArrowLeft className="size-4" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{terminal.nombre}</h1>
            <p className="text-sm text-muted-foreground">Detalle del terminal</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <MapPin className="size-5 text-neutral-500" />
            <h2 className="text-base font-semibold text-neutral-900">Información</h2>
          </div>
          <InfoRow label="Nombre" value={terminal.nombre} />
          <InfoRow label="Dirección" value={terminal.direccion} />
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Building2 className="size-5 text-neutral-500" />
            <h2 className="text-base font-semibold text-neutral-900">Ubicación</h2>
          </div>
          <InfoRow label="Departamento" value={departamento?.nombre ?? '—'} />
          <InfoRow label="Provincia" value={provincia?.nombre ?? '—'} />
          <InfoRow label="Distrito" value={distrito?.nombre ?? '—'} />
        </div>
      </div>
    </div>
  );
}
