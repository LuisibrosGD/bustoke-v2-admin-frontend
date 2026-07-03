'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
import { Separator } from '@/components/ui/separator/separator';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { agenciaRepository, rutaRepository } from '@/infrastructure/repositories';
import type { Agencia, Ruta } from '@/infrastructure/domain/types';

export default function EditarRutaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [agencia, setAgencia] = useState<Agencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [tarifaBase, setTarifaBase] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await rutaRepository.getById(params.id);
        if (!r) { setLoading(false); return; }
        setRuta(r);
        setTarifaBase(String(r.tarifaBase));
        const a = await agenciaRepository.getById(r.idAgencia);
        setAgencia(a);
      } catch {}
      setLoading(false);
    })();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ruta) return;
    setSubmitting(true);
    try {
      await rutaRepository.update(ruta.id, { tarifaBase: parseFloat(tarifaBase) || 0 });
      toast.success('Ruta actualizada correctamente');
      router.push(`/rutas/${params.id}`);
    } catch {
      toast.error('Error al actualizar la ruta');
    }
    setSubmitting(false);
  }

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Cargando...</div>;
  }

  if (!ruta) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Ruta no encontrada
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" asChild>
          <Link href={`/rutas/${params.id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Editar Ruta</h1>
          <p className="text-sm text-muted-foreground">Modifica los datos de la ruta</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-8">
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-900">Trayecto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Terminal Origen</Label>
              <p className="text-sm text-neutral-700">{ruta.terminalOrigenNombre ?? ruta.idTerminalOrigen}</p>
            </div>
            <div className="space-y-2">
              <Label>Terminal Destino</Label>
              <p className="text-sm text-neutral-700">{ruta.terminalDestinoNombre ?? ruta.idTerminalDestino}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-900">Detalles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tarifaBase">Tarifa Base (S/)</Label>
              <Input id="tarifaBase" type="number" step="0.01" value={tarifaBase} onChange={(e) => setTarifaBase(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Agencia</Label>
              <p className="text-sm text-neutral-700">{agencia?.razonSocial ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href={`/rutas/${params.id}`}>Cancelar</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          <Save className="size-4" />
          {submitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
