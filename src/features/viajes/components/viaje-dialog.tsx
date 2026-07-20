'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useUserRole } from '@/hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from '@/components/ui';
import { viajeRepository, rutaRepository, busRepository, choferRepository } from '@/infrastructure/repositories';
import type { Viaje, EstadoViaje, Ruta, Bus, Chofer } from '@/infrastructure/domain/types';
import { toast } from 'sonner';

const ESTADOS: { value: EstadoViaje; label: string }[] = [
  { value: 'programado', label: 'Programado' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viaje: Viaje | null;
  onSave: () => void;
};

export function ViajeDialog({ open, onOpenChange, viaje, onSave }: Props) {
  const { idAgencia, isAdminAgencia } = useUserRole();

  const [idRuta, setIdRuta] = useState('');
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [idBus, setIdBus] = useState('');
  const [idChofer, setIdChofer] = useState('');
  const [fechaHoraSalida, setFechaHoraSalida] = useState('');
  const [fechaHoraLlegada, setFechaHoraLlegada] = useState('');
  const [estado, setEstado] = useState<EstadoViaje>('programado');
  const [rampaEmbarque, setRampaEmbarque] = useState('');
  const [saving, setSaving] = useState(false);

  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [loading, setLoading] = useState(false);

  const origenes = useMemo(() => {
    const seen = new Set<string>();
    return rutas.filter((r) => {
      const key = String(r.idTerminalOrigen);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map((r) => ({
      id: String(r.idTerminalOrigen),
      nombre: r.terminalOrigenNombre ?? String(r.idTerminalOrigen),
    }));
  }, [rutas]);

  const destinos = useMemo(() => {
    if (!origenId) return [];
    return rutas.filter((r) => String(r.idTerminalOrigen) === origenId).map((r) => ({
      id: String(r.idTerminalDestino),
      nombre: r.terminalDestinoNombre ?? String(r.idTerminalDestino),
      rutaId: r.id,
    }));
  }, [rutas, origenId]);

  const rutaSeleccionada = useMemo(() => {
    if (!origenId || !destinoId) return null;
    return rutas.find((r) => String(r.idTerminalOrigen) === origenId && String(r.idTerminalDestino) === destinoId) ?? null;
  }, [rutas, origenId, destinoId]);

  useEffect(() => {
    if (rutaSeleccionada) {
      setIdRuta(rutaSeleccionada.id);
    } else {
      setIdRuta('');
    }
  }, [rutaSeleccionada]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const params = isAdminAgencia && idAgencia ? { idAgencia } as Record<string, string> : undefined;
    Promise.all([
      rutaRepository.list(params),
      busRepository.list(params),
      choferRepository.list(params),
    ]).then(([r, b, c]) => {
      setRutas(r);
      setBuses(b);
      setChoferes(c);
    }).finally(() => setLoading(false));
  }, [open, isAdminAgencia, idAgencia]);

  useEffect(() => {
    if (viaje) {
      const ruta = rutas.find((r) => r.id === viaje.idRuta);
      setOrigenId(ruta ? String(ruta.idTerminalOrigen) : '');
      setDestinoId(ruta ? String(ruta.idTerminalDestino) : '');
      setIdRuta(viaje.idRuta);
      setIdBus(viaje.idBus);
      setIdChofer(viaje.idChofer ?? '');
      setFechaHoraSalida(viaje.fechaHoraSalida);
      setFechaHoraLlegada(viaje.fechaHoraLlegada);
      setEstado(viaje.estado);
      setRampaEmbarque(viaje.rampaEmbarque);
    } else {
      setOrigenId('');
      setDestinoId('');
      setIdRuta('');
      setIdBus('');
      setIdChofer('');
      setFechaHoraSalida('');
      setFechaHoraLlegada('');
      setEstado('programado');
      setRampaEmbarque('');
    }
  }, [viaje, open, rutas]);

  const handleSave = useCallback(async () => {
    if (!idRuta) {
      toast.error('Selecciona terminal de origen y destino.');
      return;
    }
    if (!idBus) {
      toast.error('Selecciona un bus.');
      return;
    }
    if (!fechaHoraSalida || !fechaHoraLlegada) {
      toast.error('Completa la fecha y hora de salida y llegada.');
      return;
    }
    if (new Date(fechaHoraLlegada) <= new Date(fechaHoraSalida)) {
      toast.error('La llegada debe ser posterior a la salida.');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        idRuta,
        idBus,
        idChofer,
        fechaHoraSalida,
        fechaHoraLlegada,
        estado,
        rampaEmbarque,
      };
      if (viaje) {
        await viajeRepository.update(viaje.id, payload as Partial<Viaje>);
      } else {
        await viajeRepository.create(payload as Partial<Viaje>);
      }
      onSave();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar viaje');
    } finally {
      setSaving(false);
    }
  }, [viaje, idRuta, idBus, idChofer, fechaHoraSalida, fechaHoraLlegada, estado, rampaEmbarque, onSave]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{viaje ? 'Editar viaje' : 'Nuevo viaje'}</DialogTitle>
          <DialogDescription>
            {viaje ? 'Modifica los datos del viaje.' : 'Completa los datos para crear un nuevo viaje.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origen">Terminal Origen</Label>
              <select
                id="origen"
                className="flex h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-3.5 py-2.5 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm"
                value={origenId}
                onChange={(e) => { setOrigenId(e.target.value); setDestinoId(''); }}
                disabled={loading}
              >
                <option value="">Seleccionar origen</option>
                {origenes.map((o) => (
                  <option key={o.id} value={o.id}>{o.nombre}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destino">Terminal Destino</Label>
              <select
                id="destino"
                className="flex h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-3.5 py-2.5 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm"
                value={destinoId}
                onChange={(e) => setDestinoId(e.target.value)}
                disabled={!origenId || loading}
              >
                <option value="">Seleccionar destino</option>
                {destinos.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          {rutaSeleccionada && (
            <div className="text-sm text-muted-foreground bg-muted rounded-md px-3 py-2">
              Ruta: {rutaSeleccionada.terminalOrigenNombre ?? String(rutaSeleccionada.idTerminalOrigen)} &rarr;{' '}
              {rutaSeleccionada.terminalDestinoNombre ?? String(rutaSeleccionada.idTerminalDestino)} &mdash;{' '}
              Tarifa base: S/ {Number(rutaSeleccionada.tarifaBase).toFixed(2)}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="idBus">Bus</Label>
              <select
                id="idBus"
                className="flex h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-3.5 py-2.5 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm"
                value={idBus}
                onChange={(e) => setIdBus(e.target.value)}
                disabled={loading}
              >
                <option value="">Seleccionar bus</option>
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>{b.placa}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="idChofer">Chofer</Label>
              <select
                id="idChofer"
                className="flex h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-3.5 py-2.5 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm"
                value={idChofer}
                onChange={(e) => setIdChofer(e.target.value)}
                disabled={loading}
              >
                <option value="">Seleccionar chofer</option>
                {choferes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombres} {c.apellidoPaterno} {c.apellidoMaterno}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaHoraSalida">Salida</Label>
              <Input id="fechaHoraSalida" type="datetime-local" value={fechaHoraSalida} onChange={(e) => setFechaHoraSalida(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaHoraLlegada">Llegada</Label>
              <Input id="fechaHoraLlegada" type="datetime-local" value={fechaHoraLlegada} onChange={(e) => setFechaHoraLlegada(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <select
                id="estado"
                className="flex h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-3.5 py-2.5 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm"
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoViaje)}
              >
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rampaEmbarque">Rampa</Label>
              <Input id="rampaEmbarque" value={rampaEmbarque} onChange={(e) => setRampaEmbarque(e.target.value)} placeholder="Ej: Andén 1" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : viaje ? 'Guardar cambios' : 'Crear viaje'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
