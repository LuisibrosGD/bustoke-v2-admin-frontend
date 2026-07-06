'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye } from 'lucide-react';
import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { manifiestoRepository } from '@/infrastructure/repositories';
import type { ManifiestoDetalle, ManifiestoSutran } from '@/infrastructure/domain/types';

const ESTADO_VARIANT: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
  enviado: 'success',
  pendiente: 'warning',
  error: 'danger',
};

export default function ManifiestoSutranPage() {
  const router = useRouter();
  const [data, setData] = useState<ManifiestoSutran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ManifiestoDetalle | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);

  useEffect(() => {
    manifiestoRepository.list()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter((m) =>
    [m.id, m.idViaje, m.estadoEnvio].some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  async function abrirDetalle(id: string) {
    setDetalleLoading(true);
    try {
      const detalle = await manifiestoRepository.getById(id);
      setSelected(detalle);
    } catch {
      setError('Error al cargar detalle del manifiesto');
    } finally {
      setDetalleLoading(false);
    }
  }

  if (loading) return <div className="p-6 text-muted-foreground">Cargando manifiestos...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Manifiesto SUTRAN</h1>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          Gestión de manifiestos de pasajeros para la Superintendencia de Transporte.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="relative max-w-sm mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar manifiesto..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Viaje</TableHead>
              <TableHead>Fecha generacion</TableHead>
              <TableHead>Estado envio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium text-neutral-900">{m.idViaje}</TableCell>
                <TableCell>{new Date(m.fechaGeneracion).toLocaleDateString('es-PE')}</TableCell>
                <TableCell>
                  <Badge variant={ESTADO_VARIANT[m.estadoEnvio] || 'neutral'}>{m.estadoEnvio}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm" onClick={() => abrirDetalle(m.id)}>
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No se encontraron manifiestos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Manifiesto SUTRAN</DialogTitle>
          </DialogHeader>
          {detalleLoading ? (
            <div className="py-8 text-center text-muted-foreground">Cargando detalle...</div>
          ) : selected ? (
            <div className="space-y-5">
              {/* Manifiesto info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">ID Manifiesto</p>
                  <p className="font-medium">{selected.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ID Viaje</p>
                  <p className="font-medium">{selected.idViaje}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha generación</p>
                  <p className="font-medium">{new Date(selected.fechaGeneracion).toLocaleString('es-PE')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado envío</p>
                  <Badge variant={ESTADO_VARIANT[selected.estadoEnvio] || 'neutral'}>{selected.estadoEnvio}</Badge>
                </div>
              </div>

              {/* Viaje info */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-2">Datos del Viaje</h4>
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-neutral-50 p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Ruta</p>
                    <p className="font-medium">{selected.rutaOrigen} → {selected.rutaDestino}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bus</p>
                    <p className="font-medium">{selected.placaBus}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Salida</p>
                    <p className="font-medium">{new Date(selected.fechaHoraSalida).toLocaleString('es-PE')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Llegada</p>
                    <p className="font-medium">{new Date(selected.fechaHoraLlegada).toLocaleString('es-PE')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estado</p>
                    <p className="font-medium capitalize">{selected.viajeEstado}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rampa</p>
                    <p className="font-medium">{selected.rampaEmbarque}</p>
                  </div>
                </div>
              </div>

              {/* Respuesta API */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-2">Respuesta API SUTRAN</h4>
                <pre className="max-h-48 overflow-auto rounded-lg bg-neutral-950 p-4 text-xs text-green-400 whitespace-pre-wrap break-words">
                  {selected.respuestaApi || 'Sin respuesta'}
                </pre>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-neutral-200">
                <Button variant="outline" onClick={() => setSelected(null)}>Cerrar</Button>
                <Button onClick={() => { setSelected(null); router.push(`/viajes/${selected.idViaje}`); }}>
                  Ir al viaje
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
