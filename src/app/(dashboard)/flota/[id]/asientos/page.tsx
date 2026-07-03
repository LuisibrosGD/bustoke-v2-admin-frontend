'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { BusSeatMapEditor, type SeatDraft } from '@/features/flota/components/bus-seat-map-editor';
import { busRepository, asientoRepository } from '@/infrastructure/repositories';
import type { Asiento, Bus } from '@/infrastructure/domain/types';

export default function BusAsientosPage() {
  const params = useParams<{ id: string }>();
  const [bus, setBus] = useState<Bus | null>(null);
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<SeatDraft[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const b = await busRepository.getById(params.id);
        if (!b) { setLoading(false); return; }
        setBus(b);
        const a = await asientoRepository.listByBus(b.id);
        setAsientos(a);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  async function handleGuardar() {
    if (!bus) return;
    setSaving(true);
    try {
      await asientoRepository.replaceTemplate(bus.id, draft);
      toast.success('Plantilla de asientos actualizada');
    } catch (e) {
      toast.error(
        e instanceof Error
          ? `No se pudo guardar todavía: ${e.message}`
          : 'No se pudo guardar la plantilla de asientos'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6 text-muted-foreground">Cargando bus...</div>;
  if (!bus) return <div className="p-6 text-center text-muted-foreground">Bus no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-sm" asChild>
            <Link href={`/flota/${params.id}`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Mapa de asientos — Bus {bus.placa}</h1>
            <p className="text-sm text-muted-foreground">{bus.cantidadPisos} piso(s) · {asientos.length} asientos registrados actualmente</p>
          </div>
        </div>
        <Button onClick={handleGuardar} disabled={saving}>
          <Save className="size-4" />
          {saving ? 'Guardando...' : 'Guardar plantilla'}
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <BusSeatMapEditor
          cantidadPisos={bus.cantidadPisos}
          initialAsientos={asientos}
          onChange={setDraft}
        />
      </div>
    </div>
  );
}
