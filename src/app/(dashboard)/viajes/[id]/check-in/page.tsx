'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ClipboardCheck, SearchIcon, QrCode, BadgeCheck, XCircle, UserRoundX, ArrowUpDown, ScanIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge/badge';
import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog/dialog';
import { viajeRepository, rutaRepository, boletoRepository, pasajeroRepository, asientoRepository, terminalRepository } from '@/infrastructure/repositories';
import type { Viaje, Boleto } from '@/infrastructure/domain/types';

type CheckInStatus = 'pendiente' | 'abordado' | 'no_show';

interface CheckInRow {
  id: string;
  pasajero: string;
  documento: string;
  asientoNumero: string;
  tipoAsiento: string;
  estado: CheckInStatus;
}

const estadoVariant: Record<CheckInStatus, 'warning' | 'success' | 'danger'> = {
  pendiente: 'warning',
  abordado: 'success',
  no_show: 'danger',
};

const estadoLabel: Record<CheckInStatus, string> = {
  pendiente: 'Pendiente',
  abordado: 'Abordado',
  no_show: 'No Show',
};

const filterOptions: { label: string; value: CheckInStatus | 'todos' }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Abordado', value: 'abordado' },
  { label: 'No Show', value: 'no_show' },
];

export default function CheckinViajePage() {
  const params = useParams<{ id: string }>();
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [rutaLabel, setRutaLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CheckInStatus | 'todos'>('todos');
  const [rows, setRows] = useState<CheckInRow[]>([]);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanQr, setScanQr] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const v = await viajeRepository.getById(params.id);
        if (!v) { setLoading(false); return; }
        setViaje(v);
        const [r, boletos, asientos] = await Promise.all([
          rutaRepository.getById(v.idRuta),
          boletoRepository.getByViaje(v.id),
          asientoRepository.listByBus(v.idBus),
        ]);
        if (r) {
          const [tO, tD] = await Promise.all([
            terminalRepository.getById(r.idTerminalOrigen),
            terminalRepository.getById(r.idTerminalDestino),
          ]);
          setRutaLabel(`${tO?.nombre ?? '?'} → ${tD?.nombre ?? '?'}`);
        }
        const aMap = new Map(asientos.map((a) => [a.id, a]));
        const pMap = new Map<string, { nombres: string; apellidoPaterno: string; apellidoMaterno: string; numeroDocumento: string }>();
        await Promise.all(boletos.map(async (b) => {
          try {
            const p = await pasajeroRepository.getById(b.idPasajero);
            if (p) pMap.set(b.idPasajero, p);
          } catch {}
        }));
        setRows(boletos.map((b) => {
          const p = pMap.get(b.idPasajero);
          const a = aMap.get(b.idAsiento);
          const rawEstado = b.estadoCheckin || 'pendiente';
          const estado = (rawEstado === 'abordado' || rawEstado === 'no_show' ? rawEstado : 'pendiente') as CheckInStatus;
          return {
            id: b.id,
            pasajero: p ? `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}` : '—',
            documento: p?.numeroDocumento ?? '—',
            asientoNumero: a?.numeroAsiento ?? '—',
            tipoAsiento: a?.tipoServicio ?? '—',
            estado,
          };
        }));
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const filtered = useMemo(() => {
    let result = rows;
    if (filter !== 'todos') {
      result = result.filter((r) => r.estado === filter);
    }
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.pasajero.toLowerCase().includes(lower) ||
          r.documento.toLowerCase().includes(lower) ||
          r.asientoNumero.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [rows, search, filter]);

  const counts = useMemo(() => {
    const total = rows.length;
    const pendiente = rows.filter((r) => r.estado === 'pendiente').length;
    const abordado = rows.filter((r) => r.estado === 'abordado').length;
    const noShow = rows.filter((r) => r.estado === 'no_show').length;
    return { total, pendiente, abordado, noShow };
  }, [rows]);

  async function handleCheckIn(id: string) {
    try {
      await boletoRepository.checkIn(id, 'abordado');
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: 'abordado' as const } : r))
      );
    } catch {}
  }

  async function handleNoShow(id: string) {
    try {
      await boletoRepository.checkIn(id, 'no_show');
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: 'no_show' as const } : r))
      );
    } catch {}
  }

  async function handleMarkAllAbordado() {
    const pendientes = rows.filter((r) => r.estado === 'pendiente');
    await Promise.allSettled(pendientes.map((r) => boletoRepository.checkIn(r.id, 'abordado')));
    setRows((prev) =>
      prev.map((r) => (r.estado === 'pendiente' ? { ...r, estado: 'abordado' as const } : r))
    );
  }

  async function handleScanQr() {
    if (!scanQr.trim() || !viaje) return;
    setScanning(true);
    try {
      const boleto = await boletoRepository.scanByQr(viaje.id, scanQr.trim());
      if (boleto.estadoCheckin === 'abordado') {
        toast.error('Este boleto ya fue registrado como abordado.');
        setScanOpen(false);
        setScanQr('');
        return;
      }
      await boletoRepository.checkIn(boleto.id, 'abordado');
      setRows((prev) =>
        prev.map((r) => (r.id === boleto.id ? { ...r, estado: 'abordado' as const } : r))
      );
      toast.success(`Abordaje registrado: ${boleto.codigoQr}`);
      setScanOpen(false);
      setScanQr('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Código QR no válido para este viaje.');
    } finally {
      setScanning(false);
    }
  }

  if (loading) return <div className="p-6 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Total pasajeros</p>
          <p className="text-2xl font-bold text-neutral-900">{counts.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 shadow-sm p-4">
          <p className="text-sm text-yellow-600 font-medium">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-700">{counts.pendiente}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 shadow-sm p-4">
          <p className="text-sm text-green-600 font-medium">Abordados</p>
          <p className="text-2xl font-bold text-green-700">{counts.abordado}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm p-4">
          <p className="text-sm text-red-600 font-medium">No Show</p>
          <p className="text-2xl font-bold text-red-700">{counts.noShow}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-5 text-purple-600" />
              <h2 className="text-base font-semibold text-neutral-900">Control de Abordaje</h2>
              {rutaLabel && (
                <span className="text-sm text-neutral-500 ml-2 hidden sm:inline">
                  {rutaLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setScanOpen(true)}>
                <QrCode className="size-4 mr-1.5" />
                Escanear
              </Button>
              {counts.pendiente > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAbordado}>
                  <BadgeCheck className="size-4 mr-1.5" />
                  Abordar todos
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-neutral-100">
          <div className="relative flex-1 max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Buscar por nombre, DNI o asiento..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1">
            {filterOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={filter === opt.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(opt.value)}
                className="text-xs"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="text-left px-6 py-3 font-medium text-neutral-500">Pasajero</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-500">Documento</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-500">Asiento</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-500">Tipo</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-500">Estado</th>
                <th className="text-right px-6 py-3 font-medium text-neutral-500">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-400">
                    No se encontraron pasajeros con ese filtro.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <span className="font-medium text-neutral-900">{row.pasajero}</span>
                    </td>
                    <td className="px-6 py-3 text-neutral-600 font-mono">{row.documento}</td>
                    <td className="px-6 py-3 text-neutral-900 font-medium">{row.asientoNumero}</td>
                    <td className="px-6 py-3">
                      <Badge variant="neutral">{row.tipoAsiento}</Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={estadoVariant[row.estado]}>
                        {estadoLabel[row.estado]}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {row.estado === 'pendiente' && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="size-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Marcar como abordado"
                            onClick={() => handleCheckIn(row.id)}
                          >
                            <BadgeCheck className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="size-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                            title="Marcar como No Show"
                            onClick={() => handleNoShow(row.id)}
                          >
                            <UserRoundX className="size-4" />
                          </Button>
                        </div>
                      )}
                      {row.estado === 'abordado' && (
                        <span className="text-xs text-green-600 flex items-center justify-end gap-1">
                          <BadgeCheck className="size-3.5" /> Registrado
                        </span>
                      )}
                      {row.estado === 'no_show' && (
                        <span className="text-xs text-red-500 flex items-center justify-end gap-1">
                          <XCircle className="size-3.5" /> No abordó
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-neutral-100 text-xs text-neutral-400 flex items-center justify-between">
          <span>
            Mostrando {filtered.length} de {rows.length} pasajeros
          </span>
          <span className="flex items-center gap-1">
            <ArrowUpDown className="size-3" />
            Los cambios se aplican en tiempo real
          </span>
        </div>
      </div>

      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escanear código QR</DialogTitle>
            <DialogDescription>
              Ingresa o escanea el código QR del boleto para registrar el abordaje.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/20">
              <ScanIcon className="size-8 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                Usa un lector de QR o pega el código directamente en el campo de abajo.
              </p>
            </div>
            <Input
              placeholder="Código QR del boleto..."
              value={scanQr}
              onChange={(e) => setScanQr(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleScanQr(); }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setScanOpen(false); setScanQr(''); }}>
              Cancelar
            </Button>
            <Button onClick={handleScanQr} disabled={!scanQr.trim() || scanning}>
              {scanning ? 'Buscando...' : 'Registrar abordaje'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
