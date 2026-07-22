'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui';
import { BusSeatMapEditor, type AmenidadDraft, type SeatDraft } from '@/features/flota/components/bus-seat-map-editor';
import { busRepository, asientoRepository, amenidadRepository } from '@/infrastructure/repositories';
import type { TemplateDiff } from '@/infrastructure/repositories/asientos.repository';
import type { Amenidad, Asiento, Bus } from '@/infrastructure/domain/types';

function amenidadesCambiaron(existentes: Amenidad[], draft: AmenidadDraft[]): boolean {
  const normalizar = (a: { tipo: string; piso: number; coordX: number; coordY: number }) =>
    `${a.tipo}|${a.piso}|${a.coordX}|${a.coordY}`;
  const setExistente = new Set(existentes.map(normalizar));
  const setDraft = new Set(draft.map(normalizar));
  if (setExistente.size !== setDraft.size) return true;
  for (const key of setExistente) {
    if (!setDraft.has(key)) return true;
  }
  return false;
}

export default function BusAsientosPage() {
  const params = useParams<{ id: string }>();
  const [bus, setBus] = useState<Bus | null>(null);
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [amenidades, setAmenidades] = useState<Amenidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<SeatDraft[]>([]);
  const [draftAmenidades, setDraftAmenidades] = useState<AmenidadDraft[]>([]);
  const [confirmDiff, setConfirmDiff] = useState<TemplateDiff | null>(null);
  const [amenidadesDiff, setAmenidadesDiff] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const b = await busRepository.getById(params.id);
        if (!b) { setLoading(false); return; }
        setBus(b);
        const [a, am] = await Promise.all([
          asientoRepository.listByBus(b.id),
          amenidadRepository.listByBus(b.id),
        ]);
        setAsientos(a);
        setAmenidades(am);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  function handleGuardarClick() {
    const diff = asientoRepository.diffTemplate(asientos, draft);
    const huboAmenidadesDiff = amenidadesCambiaron(amenidades, draftAmenidades);
    if (diff.crear === 0 && diff.actualizar === 0 && diff.eliminar === 0 && !huboAmenidadesDiff) {
      toast.info('No hay cambios en la plantilla de asientos.');
      return;
    }
    setAmenidadesDiff(huboAmenidadesDiff);
    setConfirmDiff(diff);
  }

  async function handleGuardarConfirmado() {
    if (!bus) return;
    setConfirmDiff(null);
    setSaving(true);
    try {
      const [resultado] = await Promise.all([
        asientoRepository.syncTemplate(bus.id, draft),
        amenidadesDiff ? amenidadRepository.replaceForBus(bus.id, draftAmenidades) : Promise.resolve(null),
      ]);
      setAsientos(await asientoRepository.listByBus(bus.id));
      if (amenidadesDiff) setAmenidades(await amenidadRepository.listByBus(bus.id));

      if (resultado.eliminacionesFallidas.length > 0) {
        toast.warning(
          `Plantilla actualizada, pero ${resultado.eliminacionesFallidas.length} asiento(s) no se pudieron eliminar porque ya tienen boletos vendidos: ${resultado.eliminacionesFallidas.map((f) => f.numeroAsiento).join(', ')}`
        );
      } else {
        toast.success(
          `Plantilla actualizada: ${resultado.creados} creado(s), ${resultado.actualizados} actualizado(s), ${resultado.eliminados} eliminado(s)${amenidadesDiff ? ', amenidades actualizadas' : ''}.`
        );
      }
    } catch (e) {
      toast.error(
        e instanceof Error
          ? `No se pudo guardar la plantilla: ${e.message}`
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
        <Button onClick={handleGuardarClick} disabled={saving}>
          <Save className="size-4" />
          {saving ? 'Guardando...' : 'Guardar plantilla'}
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <BusSeatMapEditor
          cantidadPisos={bus.cantidadPisos}
          initialAsientos={asientos}
          initialAmenidades={amenidades}
          onChange={(seats, am) => { setDraft(seats); setDraftAmenidades(am); }}
        />
      </div>

      <AlertDialog open={!!confirmDiff} onOpenChange={(open) => { if (!open) setConfirmDiff(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Guardar cambios en la plantilla de asientos?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto afecta el tipo de servicio (y por lo tanto la tarifa) de los asientos de este bus en los próximos viajes.
              {confirmDiff && (
                <span className="mt-2 block text-neutral-700">
                  {confirmDiff.crear > 0 && <>Se crearán <strong>{confirmDiff.crear}</strong> asiento(s) nuevo(s). </>}
                  {confirmDiff.actualizar > 0 && <>Se actualizarán <strong>{confirmDiff.actualizar}</strong> asiento(s). </>}
                  {confirmDiff.eliminar > 0 && <>Se eliminarán <strong>{confirmDiff.eliminar}</strong> asiento(s) (los que tengan boletos vendidos no se podrán eliminar). </>}
                  {amenidadesDiff && <>Se actualizarán las amenidades (TV, baño, escaleras, cafetera) del plano.</>}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleGuardarConfirmado}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
