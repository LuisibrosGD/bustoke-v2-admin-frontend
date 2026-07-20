'use client';

import { useMemo, useState, useEffect } from 'react';
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { DollarSign, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { agenciaRepository, liquidacionRepository } from '@/infrastructure/repositories';
import type { Agencia, Liquidacion } from '@/infrastructure/domain/types';
import { useUserRole } from '@/hooks';
import { toast } from 'sonner';

const ESTADO_VARIANT: Record<string, 'warning' | 'success' | 'danger' | 'neutral'> = {
  pendiente: 'warning',
  completado: 'success',
  fallido: 'danger',
  reembolsado: 'neutral',
};

export default function ComisionesPage() {
  const { isSuperadmin: isSuperAdmin } = useUserRole();
  const [data, setData] = useState<Liquidacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [agencias, setAgencias] = useState<Agencia[]>([]);

  useEffect(() => {
    Promise.all([
      liquidacionRepository.list(),
      agenciaRepository.list(),
    ])
      .then(([liquidaciones, ags]) => {
        setData(liquidaciones);
        setAgencias(ags);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, []);

  const agenciasMap = useMemo(() => new Map(agencias.map((a) => [String(a.id), a])), [agencias]);

  async function marcarTransferido(id: string) {
    setUpdating(id);
    try {
      const updated = await liquidacionRepository.update(id, { estadoPago: 'completado' });
      setData((prev) => prev.map((l) => l.id === id ? { ...l, estadoPago: updated.estadoPago } : l));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al actualizar');
    } finally {
      setUpdating(null);
    }
  }

  const totalPendiente = data
    .filter((l) => l.estadoPago === 'pendiente')
    .reduce((sum, l) => sum + Number(l.comisionPlataforma), 0);
  const totalPagado = data
    .filter((l) => l.estadoPago === 'completado')
    .reduce((sum, l) => sum + Number(l.comisionPlataforma), 0);
  const totalVentas = data.reduce((sum, l) => sum + Number(l.montoVentas), 0);
  const totalComisiones = data.reduce((sum, l) => sum + Number(l.comisionPlataforma), 0);
  const tasaPromedio = totalVentas > 0
    ? ((totalComisiones / totalVentas) * 100).toFixed(1)
    : '0.0';

  if (loading) return <div className="p-6 text-muted-foreground">Cargando comisiones...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Comisiones</h1>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          Gestión de comisiones y dispersión de pagos por agencia.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 shrink-0">
              <Clock className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Comisiones pendientes</p>
              <p className="text-xl font-bold text-neutral-900 mt-0.5">S/ {totalPendiente.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <DollarSign className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Comisiones pagadas</p>
              <p className="text-xl font-bold text-neutral-900 mt-0.5">S/ {totalPagado.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <TrendingUp className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Tasa promedio</p>
              <p className="text-xl font-bold text-neutral-900 mt-0.5">{tasaPromedio}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agencia</TableHead>
              <TableHead>Periodo</TableHead>
              <TableHead>Monto ventas</TableHead>
              <TableHead>Comisión</TableHead>
              <TableHead>Monto a transferir</TableHead>
              <TableHead>Estado</TableHead>
              {isSuperAdmin && <TableHead className="w-40">Acción</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium text-neutral-900">{agenciasMap.get(String(l.idAgencia))?.razonSocial ?? l.idAgencia}</TableCell>
                <TableCell>{l.periodo}</TableCell>
                <TableCell>S/ {Number(l.montoVentas).toLocaleString()}</TableCell>
                <TableCell>S/ {Number(l.comisionPlataforma).toLocaleString()}</TableCell>
                <TableCell>S/ {Number(l.montoATransferir).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={ESTADO_VARIANT[l.estadoPago]}>{l.estadoPago}</Badge>
                </TableCell>
                {isSuperAdmin && (
                  <TableCell>
                    {l.estadoPago === 'pendiente' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1"
                        onClick={() => marcarTransferido(l.id)}
                        disabled={updating === l.id}
                      >
                        <CheckCircle className="size-3.5" />
                        {updating === l.id ? '...' : 'Transferido'}
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  No hay liquidaciones registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
