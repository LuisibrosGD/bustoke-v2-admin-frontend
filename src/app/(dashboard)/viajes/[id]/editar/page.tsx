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
import { busRepository, rutaRepository, viajeRepository } from '@/infrastructure/repositories';
import type { Bus, EstadoViaje, Ruta, Viaje } from '@/infrastructure/domain/types';

const estados: { value: EstadoViaje; label: string }[] = [
  { value: 'programado', label: 'Programado' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
];

export default function EditarViajePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [bus, setBus] = useState<Bus | null>(null);
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [loading, setLoading] = useState(true);
  const [fechaHora, setFechaHora] = useState('');
  const [rampaEmbarque, setRampaEmbarque] = useState('');
  const [estado, setEstado] = useState<EstadoViaje>('programado');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const v = await viajeRepository.getById(params.id);
        if (!v) { setLoading(false); return; }
        setViaje(v);
        setFechaHora(v.fechaHoraSalida.slice(0, 16));
        setRampaEmbarque(v.rampaEmbarque);
        setEstado(v.estado);
        const [b, r] = await Promise.all([
          busRepository.getById(v.idBus),
          rutaRepository.getById(v.idRuta),
        ]);
        setBus(b);
        setRuta(r);
      } catch {}
      setLoading(false);
    })();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!viaje) return;
    setSubmitting(true);
    try {
      await viajeRepository.update(viaje.id, {
        fechaHoraSalida: new Date(fechaHora).toISOString(),
        rampaEmbarque,
        estado,
      });
      toast.success('Viaje actualizado correctamente');
      router.push(`/viajes/${params.id}`);
    } catch {
      toast.error('Error al actualizar el viaje');
    }
    setSubmitting(false);
  }

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Cargando...</div>;
  }

  if (!viaje) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Viaje no encontrado
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" asChild>
          <Link href={`/viajes/${params.id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Editar Viaje</h1>
          <p className="text-sm text-muted-foreground">Modifica los datos del viaje</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-8">
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-900">Programación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaHora">Fecha y hora de salida</Label>
              <Input id="fechaHora" type="datetime-local" value={fechaHora} onChange={(e) => setFechaHora(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ruta</Label>
              <p className="text-sm text-neutral-700">
                {ruta?.terminalOrigenNombre ?? ruta?.idTerminalOrigen ?? '?'} → {ruta?.terminalDestinoNombre ?? ruta?.idTerminalDestino ?? '?'}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-900">Unidad</h2>
          <div className="space-y-2">
            <Label>Bus asignado</Label>
            <p className="text-sm text-neutral-700">{bus?.placa ?? '—'}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rampa">Rampa de embarque</Label>
            <Input id="rampa" value={rampaEmbarque} onChange={(e) => setRampaEmbarque(e.target.value)} />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-900">Estado</h2>
          <div className="flex flex-wrap gap-2">
            {estados.map((e) => (
              <button
                key={e.value}
                type="button"
                onClick={() => setEstado(e.value)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                  estado === e.value
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href={`/viajes/${params.id}`}>Cancelar</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          <Save className="size-4" />
          {submitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
