'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { ArrowLeft, Route, CalendarCheck, ArrowRight, Building2, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { agenciaRepository, rutaRepository, tarifaRepository, viajeRepository } from '@/infrastructure/repositories';
import type { Agencia, Ruta, TarifaRuta } from '@/infrastructure/domain/types';

function InfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
      <span className="text-sm font-medium text-neutral-500 min-w-[140px]">{label}</span>
      <div className="text-sm text-neutral-900">{value}</div>
    </div>
  );
}

export default function RutaDetailPage() {
  const params = useParams<{ id: string }>();
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [agencia, setAgencia] = useState<Agencia | null>(null);
  const [viajesCount, setViajesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [tarifas, setTarifas] = useState<TarifaRuta[]>([]);
  const [loadingTarifas, setLoadingTarifas] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrecio, setEditPrecio] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTipo, setNewTipo] = useState<'normal' | 'vip'>('normal');
  const [newPrecio, setNewPrecio] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await rutaRepository.getById(params.id);
        if (!r) { setLoading(false); return; }
        setRuta(r);
        const [a, viajes] = await Promise.all([
          agenciaRepository.getById(r.idAgencia),
          viajeRepository.findByRuta(params.id),
        ]);
        setAgencia(a);
        setViajesCount(viajes.length);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  useEffect(() => {
    tarifaRepository.listByRuta(params.id)
      .then(setTarifas)
      .catch(() => setTarifas([]))
      .finally(() => setLoadingTarifas(false));
  }, [params.id]);

  async function handleUpdate(tarifaId: string) {
    const precio = parseFloat(editPrecio);
    if (isNaN(precio) || precio <= 0) return;
    await tarifaRepository.update(tarifaId, { precio });
    setTarifas((prev) => prev.map((t) => (t.id === tarifaId ? { ...t, precio } : t)));
    setEditingId(null);
  }

  async function handleDelete(tarifaId: string) {
    await tarifaRepository.delete(tarifaId);
    setTarifas((prev) => prev.filter((t) => t.id !== tarifaId));
  }

  async function handleCreate() {
    const precio = parseFloat(newPrecio);
    if (isNaN(precio) || precio <= 0) return;
    const created = await tarifaRepository.create({ idRuta: parseInt(params.id), tipoServicio: newTipo, precio });
    setTarifas((prev) => [...prev, created]);
    setShowCreate(false);
    setNewPrecio('');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-sm" asChild>
            <Link href="/rutas">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              {ruta.terminalOrigenNombre ?? ruta.idTerminalOrigen} → {ruta.terminalDestinoNombre ?? ruta.idTerminalDestino}
            </h1>
            <p className="text-sm text-muted-foreground">Detalle de ruta</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Route className="size-5 text-neutral-500" />
            <h2 className="text-base font-semibold text-neutral-900">Informaci&oacute;n</h2>
          </div>
          <InfoRow
            label="Agencia"
            value={
              <span className="flex items-center gap-1.5">
                <Building2 className="size-3.5 text-neutral-400" />
                {agencia?.razonSocial ?? '—'}
              </span>
            }
          />
          <InfoRow label="Origen" value={ruta.terminalOrigenNombre ?? ruta.idTerminalOrigen} />
          <InfoRow label="Destino" value={ruta.terminalDestinoNombre ?? ruta.idTerminalDestino} />
          <InfoRow label="Tarifa Base" value={`S/ ${Number(ruta.tarifaBase).toFixed(2)}`} />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-lg bg-blue-50 text-blue-600">
              <CalendarCheck className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{viajesCount}</p>
              <p className="text-sm text-neutral-500">Viajes registrados</p>
            </div>
          </div>
          <Button variant="outline" className="h-auto p-5 flex items-center gap-4" asChild>
            <Link href={`/rutas/${params.id}/viajes`}>
              <div className="flex items-center justify-center size-12 rounded-lg bg-emerald-50 text-emerald-600">
                <CalendarCheck className="size-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-2xl font-bold text-neutral-900">Ver Viajes</p>
                <p className="text-sm text-neutral-500">Programaci&oacute;n de viajes de esta ruta</p>
              </div>
              <ArrowRight className="size-5 text-neutral-400" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Tarifas por tipo de servicio */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
          <div className="flex items-center gap-2">
            <Route className="size-5 text-neutral-500" />
            <h2 className="text-base font-semibold text-neutral-900">Tarifas por tipo de servicio</h2>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="size-4" />
            Agregar tarifa
          </Button>
        </div>

        {loadingTarifas ? (
          <p className="text-sm text-muted-foreground py-4">Cargando tarifas...</p>
        ) : tarifas.length === 0 && !showCreate ? (
          <p className="text-sm text-muted-foreground py-4">No hay tarifas configuradas para esta ruta.</p>
        ) : (
          <div className="space-y-2">
            {tarifas.map((t) => (
              <div key={t.id} className="flex items-center justify-between bg-neutral-50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-neutral-900 capitalize">{t.tipoServicio}</span>
                  {editingId === t.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-400">S/</span>
                      <Input
                        type="number"
                        step="0.01"
                        className="w-24 h-8 text-sm"
                        value={editPrecio}
                        onChange={(e) => setEditPrecio(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(t.id); if (e.key === 'Escape') setEditingId(null); }}
                        autoFocus
                      />
                      <Button size="icon-sm" variant="ghost" onClick={() => handleUpdate(t.id)}>
                        <Check className="size-4 text-emerald-600" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="size-4 text-neutral-400" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-neutral-700">S/ {Number(t.precio).toFixed(2)}</span>
                  )}
                </div>
                {editingId !== t.id && (
                  <div className="flex items-center gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => { setEditingId(t.id); setEditPrecio(String(t.precio)); }}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {showCreate && (
              <div className="flex items-center gap-3 bg-blue-50 rounded-lg px-4 py-3">
                <select
                  className="text-sm border border-neutral-200 rounded-md px-2 py-1.5 bg-white"
                  value={newTipo}
                  onChange={(e) => setNewTipo(e.target.value as 'normal' | 'vip')}
                >
                  <option value="normal">Normal</option>
                  <option value="vip">VIP</option>
                </select>
                <span className="text-sm text-neutral-400">S/</span>
                <Input
                  type="number"
                  step="0.01"
                  className="w-24 h-8 text-sm"
                  placeholder="0.00"
                  value={newPrecio}
                  onChange={(e) => setNewPrecio(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowCreate(false); }}
                  autoFocus
                />
                <Button size="sm" onClick={handleCreate}>
                  <Check className="size-4" />
                  Guardar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
