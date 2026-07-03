'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks';
import { FlotaTable } from '@/features/flota/components';
import { busRepository, agenciaRepository } from '@/infrastructure/repositories';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input } from '@/components/ui';
import type { Agencia } from '@/infrastructure/domain/types';

export default function FlotaPage() {
  const { idAgencia, isSuperadmin } = useUserRole();

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ idAgencia: '', placa: '', cantidadPisos: '1' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isSuperadmin) agenciaRepository.list().then(setAgencias);
  }, [isSuperadmin]);

  function openCreate() {
    setForm({
      idAgencia: isSuperadmin ? '' : (idAgencia || ''),
      placa: '',
      cantidadPisos: '1',
    });
    setModal(true);
  }

  async function handleCreate() {
    if (!form.idAgencia || !form.placa.trim()) {
      toast.error('Completa la agencia y la placa.');
      return;
    }
    setSubmitting(true);
    try {
      await busRepository.create({
        idAgencia: form.idAgencia,
        placa: form.placa.trim(),
        cantidadPisos: parseInt(form.cantidadPisos) || 1,
      });
      setModal(false);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al crear el bus');
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDelete(id: string) {
    setDeleteId(id);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await busRepository.delete(deleteId);
      setDeleteId(null);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar el bus');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Flota de Buses</h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            Unidades de transporte registradas por cada agencia.
          </p>
        </div>
        <Button onClick={openCreate}>Nuevo Bus</Button>
      </div>
      <FlotaTable key={refreshKey} onDelete={confirmDelete} />

      {modal && (
        <Dialog open onOpenChange={(o) => { if (!o) setModal(false); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Bus</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {isSuperadmin && (
                <div>
                  <label className="text-sm font-medium">Agencia</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.idAgencia}
                    onChange={(e) => setForm({ ...form, idAgencia: e.target.value })}
                  >
                    <option value="">Seleccionar agencia</option>
                    {agencias.map((a) => (
                      <option key={a.id} value={a.id}>{a.razonSocial}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Placa</label>
                <Input placeholder="Ej: ABC-123" value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Cantidad de Pisos</label>
                <Input type="number" min={1} max={2} value={form.cantidadPisos} onChange={(e) => setForm({ ...form, cantidadPisos: e.target.value })} />
              </div>
            </div>
            <DialogFooter showCloseButton>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteId && (
        <Dialog open onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar eliminaci&oacute;n</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">¿Estás seguro de eliminar este bus?</p>
            <DialogFooter showCloseButton>
              <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                {submitting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
