'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks';
import { RutasTable } from '@/features/rutas/components';
import { rutaRepository, terminalRepository, agenciaRepository } from '@/infrastructure/repositories';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input } from '@/components/ui';
import { BulkUploadDialog } from '@/components/shared';
import { uploadBulkDataAction } from '@/lib/actions/bulk-upload.actions';
import { UploadIcon } from 'lucide-react';
import type { Ruta, Terminal, Agencia } from '@/infrastructure/domain/types';

export default function RutasPage() {
  const { idAgencia, isSuperadmin, isAdminAgencia, isAdminTerminal } = useUserRole();

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Ruta | null>(null);
  const [form, setForm] = useState({ idAgencia: '', idTerminalOrigen: '', idTerminalDestino: '', tarifaBase: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  useEffect(() => {
    const params = !isSuperadmin && idAgencia ? { idAgencia } as Record<string, string> : undefined;
    terminalRepository.list(params).then(setTerminals);
    if (isSuperadmin) agenciaRepository.list().then(setAgencias);
  }, [isSuperadmin, idAgencia]);

  function openCreate() {
    setEditing(null);
    setForm({
      idAgencia: isSuperadmin ? '' : (idAgencia || ''),
      idTerminalOrigen: '',
      idTerminalDestino: '',
      tarifaBase: '',
    });
    setModal('create');
  }

  function openEdit(ruta: Ruta) {
    setEditing(ruta);
    setForm({
      idAgencia: ruta.idAgencia,
      idTerminalOrigen: ruta.idTerminalOrigen,
      idTerminalDestino: ruta.idTerminalDestino,
      tarifaBase: String(ruta.tarifaBase),
    });
    setModal('edit');
  }

  async function handleSave() {
    if (isSuperadmin && !form.idAgencia) {
      toast.error('Selecciona una agencia.');
      return;
    }
    if (!form.idTerminalOrigen || !form.idTerminalDestino) {
      toast.error('Selecciona terminal de origen y destino.');
      return;
    }
    if (form.idTerminalOrigen === form.idTerminalDestino) {
      toast.error('El terminal de origen y destino no pueden ser el mismo.');
      return;
    }
    const tarifaBase = parseFloat(form.tarifaBase);
    if (isNaN(tarifaBase) || tarifaBase <= 0) {
      toast.error('Ingresa una tarifa base válida.');
      return;
    }
    const payload = {
      idAgencia: form.idAgencia,
      idTerminalOrigen: form.idTerminalOrigen,
      idTerminalDestino: form.idTerminalDestino,
      tarifaBase,
    };
    setSubmitting(true);
    try {
      if (modal === 'create') {
        await rutaRepository.create(payload);
      } else if (modal === 'edit' && editing) {
        await rutaRepository.update(editing.id, payload);
      }
      setModal(null);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar la ruta');
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
      await rutaRepository.delete(deleteId);
      setDeleteId(null);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar la ruta');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Rutas</h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            Conexiones interprovinciales configuradas en el sistema.
          </p>
        </div>
        {!isAdminTerminal && (
          <div className="flex items-center gap-2">
            {isAdminAgencia && (
              <Button variant="outline" onClick={() => setBulkOpen(true)}>
                <UploadIcon className="size-4" /> Carga masiva
              </Button>
            )}
            <Button onClick={openCreate}>Nueva Ruta</Button>
          </div>
        )}
      </div>
      <RutasTable key={refreshKey} onEdit={openEdit} onDelete={confirmDelete} />

      <BulkUploadDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        title="Carga masiva de rutas"
        description="Sube un Excel (.xlsx) con tus rutas: terminal origen, terminal destino y tarifa base."
        endpoint="/admin/rutas/carga-masiva"
        templateEndpoint="/admin/rutas/carga-masiva/plantilla"
        uploadAction={uploadBulkDataAction}
        onSuccess={() => setRefreshKey((k) => k + 1)}
        columns={[
          { name: 'Terminal Origen', example: 'Terminal Terrestre Plaza Norte' },
          { name: 'Terminal Destino', example: 'Terminal Terrestre de Trujillo' },
          { name: 'Tarifa Base', example: '45.00' },
        ]}
      />

      {modal && (
        <Dialog open onOpenChange={(o) => { if (!o) setModal(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{modal === 'create' ? 'Nueva Ruta' : 'Editar Ruta'}</DialogTitle>
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
                <label className="text-sm font-medium">Terminal Origen</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.idTerminalOrigen}
                  onChange={(e) => setForm({ ...form, idTerminalOrigen: e.target.value })}
                >
                  <option value="">Seleccionar terminal origen</option>
                  {terminals.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Terminal Destino</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.idTerminalDestino}
                  onChange={(e) => setForm({ ...form, idTerminalDestino: e.target.value })}
                >
                  <option value="">Seleccionar terminal destino</option>
                  {terminals.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Tarifa Base (S/)</label>
                <Input type="number" step="0.01" value={form.tarifaBase} onChange={(e) => setForm({ ...form, tarifaBase: e.target.value })} />
              </div>
            </div>
            <DialogFooter showCloseButton>
              <Button onClick={handleSave} disabled={submitting}>
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
            <p className="text-sm text-muted-foreground">¿Estás seguro de eliminar esta ruta?</p>
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
