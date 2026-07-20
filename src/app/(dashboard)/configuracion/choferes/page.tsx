'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserRole } from '@/hooks';
import {
  Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Label,
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui';
import { BulkUploadDialog } from '@/components/shared';
import { uploadBulkDataAction } from '@/lib/actions/bulk-upload.actions';
import { PencilIcon, Trash2, Plus, UploadIcon } from 'lucide-react';
import { choferRepository, agenciaRepository, ubigeoRepository } from '@/infrastructure/repositories';
import type { TipoDocumentoCatalogo } from '@/infrastructure/repositories/ubigeo.repository';
import type { Chofer, Agencia } from '@/infrastructure/domain/types';
import { toast } from 'sonner';

const selectClass = 'flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400';

export default function ChoferesPage() {
  const { idAgencia, isSuperadmin, isAdminAgencia } = useUserRole();

  const [data, setData] = useState<Chofer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumentoCatalogo[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Chofer | null>(null);
  const [form, setForm] = useState({
    idAgencia: '', idTipoDocumento: '', numeroDocumento: '', nombres: '', apellidoPaterno: '', apellidoMaterno: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadChoferes = useCallback(() => {
    setLoading(true);
    const params = !isSuperadmin && idAgencia ? { idAgencia } : undefined;
    choferRepository.list(params)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, [isSuperadmin, idAgencia]);

  useEffect(() => {
    loadChoferes();
  }, [loadChoferes]);

  useEffect(() => {
    if (isSuperadmin) agenciaRepository.list().then(setAgencias).catch(() => {});
  }, [isSuperadmin]);

  useEffect(() => {
    ubigeoRepository.getTiposDocumento().then(setTiposDocumento).catch(() => {});
  }, []);

  const tiposMap = new Map(tiposDocumento.map((t) => [t.id, t]));
  const agenciasMap = new Map(agencias.map((a) => [a.id, a]));

  function openCreate() {
    setEditing(null);
    setForm({
      idAgencia: isSuperadmin ? '' : (idAgencia || ''),
      idTipoDocumento: '',
      numeroDocumento: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
    });
    setDialogOpen(true);
  }

  function openEdit(c: Chofer) {
    setEditing(c);
    setForm({
      idAgencia: c.idAgencia,
      idTipoDocumento: c.idTipoDocumento,
      numeroDocumento: c.numeroDocumento,
      nombres: c.nombres,
      apellidoPaterno: c.apellidoPaterno,
      apellidoMaterno: c.apellidoMaterno,
    });
    setDialogOpen(true);
  }

  function resetDialog() {
    setDialogOpen(false);
    setEditing(null);
  }

  async function handleSubmit() {
    if (isSuperadmin && !form.idAgencia) {
      toast.error('Selecciona una agencia.');
      return;
    }
    if (!form.idTipoDocumento) {
      toast.error('Selecciona un tipo de documento.');
      return;
    }
    if (!form.numeroDocumento.trim() || !form.nombres.trim() || !form.apellidoPaterno.trim() || !form.apellidoMaterno.trim()) {
      toast.error('Completa todos los campos.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        idAgencia: form.idAgencia,
        idTipoDocumento: form.idTipoDocumento,
        numeroDocumento: form.numeroDocumento.trim(),
        nombres: form.nombres.trim(),
        apellidoPaterno: form.apellidoPaterno.trim(),
        apellidoMaterno: form.apellidoMaterno.trim(),
      };
      if (editing) {
        await choferRepository.update(editing.id, payload);
        toast.success('Chofer actualizado');
      } else {
        await choferRepository.create(payload);
        toast.success('Chofer creado');
      }
      resetDialog();
      loadChoferes();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar el chofer');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await choferRepository.delete(deletingId);
      setDeletingId(null);
      loadChoferes();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar el chofer');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <div className="p-6 text-muted-foreground">Cargando choferes...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Choferes</h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            Conductores registrados para la operación de viajes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdminAgencia && (
            <Button variant="outline" onClick={() => setBulkOpen(true)}>
              <UploadIcon className="size-4" /> Carga masiva
            </Button>
          )}
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Nuevo chofer
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Nombres</TableHead>
              <TableHead>Apellidos</TableHead>
              {isSuperadmin && <TableHead>Agencia</TableHead>}
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-neutral-900">
                  {tiposMap.get(c.idTipoDocumento)?.nombre ?? ''} {c.numeroDocumento}
                </TableCell>
                <TableCell>{c.nombres}</TableCell>
                <TableCell>{c.apellidoPaterno} {c.apellidoMaterno}</TableCell>
                {isSuperadmin && (
                  <TableCell>{agenciasMap.get(c.idAgencia)?.razonSocial ?? c.idAgencia}</TableCell>
                )}
                <TableCell>
                  <Badge variant={c.activo ? 'success' : 'neutral'}>{c.activo ? 'Activo' : 'Inactivo'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)}>
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeletingId(c.id)}>
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={isSuperadmin ? 6 : 5} className="text-center py-8 text-muted-foreground">
                  No hay choferes registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetDialog(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar chofer' : 'Nuevo chofer'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {isSuperadmin && (
              <div className="space-y-1">
                <Label>Agencia</Label>
                <select className={selectClass} value={form.idAgencia} onChange={(e) => setForm({ ...form, idAgencia: e.target.value })}>
                  <option value="">Seleccionar agencia...</option>
                  {agencias.map((a) => (
                    <option key={a.id} value={a.id}>{a.razonSocial}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1">
              <Label>Tipo de documento</Label>
              <select className={selectClass} value={form.idTipoDocumento} onChange={(e) => setForm({ ...form, idTipoDocumento: e.target.value })}>
                <option value="">Seleccionar...</option>
                {tiposDocumento.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Número de documento</Label>
              <Input value={form.numeroDocumento} onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Nombres</Label>
              <Input value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Apellido paterno</Label>
                <Input value={form.apellidoPaterno} onChange={(e) => setForm({ ...form, apellidoPaterno: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Apellido materno</Label>
                <Input value={form.apellidoMaterno} onChange={(e) => setForm({ ...form, apellidoMaterno: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este chofer?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BulkUploadDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        title="Carga masiva de choferes"
        description="Sube un Excel (.xlsx) con tu roster de choferes."
        endpoint="/admin/choferes/carga-masiva"
        templateEndpoint="/admin/choferes/carga-masiva/plantilla"
        uploadAction={uploadBulkDataAction}
        onSuccess={loadChoferes}
        columns={[
          { name: 'Tipo Documento', example: 'DNI' },
          { name: 'Número Documento', example: '12345678' },
          { name: 'Nombres', example: 'Juan Carlos' },
          { name: 'Apellido Paterno', example: 'Pérez' },
          { name: 'Apellido Materno', example: 'García' },
        ]}
      />
    </div>
  );
}
