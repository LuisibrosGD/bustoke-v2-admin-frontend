'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUserRole } from '@/hooks';
import { TerminalesTable } from '@/features/terminales/components';
import { terminalRepository, ubigeoRepository } from '@/infrastructure/repositories';
import { useRepository } from '@/infrastructure/hooks/use-repository';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input } from '@/components/ui';
import type { Terminal, Departamento, Provincia, Distrito } from '@/infrastructure/domain/types';
import { toast } from 'sonner';
import { PlusIcon } from 'lucide-react';

export default function TerminalesPage() {
  const { isAdminTerminal } = useUserRole();
  const { data, isLoading, error, refetch } = useRepository(terminalRepository);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Terminal | null>(null);
  const [form, setForm] = useState({ idDistrito: '', nombre: '', direccion: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [todasProvincias, setTodasProvincias] = useState<Provincia[]>([]);
  const [todosDistritos, setTodosDistritos] = useState<Distrito[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedProv, setSelectedProv] = useState('');

  useEffect(() => {
    Promise.all([
      ubigeoRepository.getDepartamentos(),
      ubigeoRepository.getProvincias(),
      ubigeoRepository.getDistritos(),
    ]).then(([deps, provs, dists]) => {
      setDepartamentos(deps);
      setTodasProvincias(provs);
      setTodosDistritos(dists);
    });
  }, []);

  const provincias = useMemo(() => {
    if (!selectedDept) return [];
    return todasProvincias.filter((p) => String(p.idDepartamento) === selectedDept);
  }, [todasProvincias, selectedDept]);

  const distritos = useMemo(() => {
    if (!selectedProv) return [];
    return todosDistritos.filter((d) => String(d.idProvincia) === selectedProv);
  }, [todosDistritos, selectedProv]);

  function openCreate() {
    setEditing(null);
    setForm({ idDistrito: '', nombre: '', direccion: '' });
    setSelectedDept('');
    setSelectedProv('');
    setModal('create');
  }

  function openEdit(terminal: Terminal) {
    setEditing(terminal);
    setForm({ idDistrito: terminal.idDistrito, nombre: terminal.nombre, direccion: terminal.direccion });
    const distrito = todosDistritos.find((d) => String(d.id) === String(terminal.idDistrito));
    if (distrito) {
      const provincia = todasProvincias.find((p) => String(p.id) === String(distrito.idProvincia));
      setSelectedProv(provincia ? String(provincia.id) : '');
      const depto = departamentos.find((d) => provincia && String(d.id) === String(provincia.idDepartamento));
      setSelectedDept(depto ? String(depto.id) : '');
    } else {
      setSelectedDept('');
      setSelectedProv('');
    }
    setModal('edit');
  }

  async function handleSave() {
    if (!form.idDistrito || !form.nombre.trim() || !form.direccion.trim()) {
      toast.error('Completa el distrito, nombre y dirección del terminal.');
      return;
    }
    setSaving(true);
    try {
      if (modal === 'create') {
        await terminalRepository.create(form);
        toast.success('Terminal creado correctamente.', { duration: 3000 });
      } else if (modal === 'edit' && editing) {
        await terminalRepository.update(editing.id, form);
        toast.success('Terminal actualizado correctamente.', { duration: 3000 });
      }
      setModal(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar el terminal');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(terminal: Terminal) {
    setDeleteId(terminal.id);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await terminalRepository.delete(deleteId);
      setDeleteId(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar el terminal');
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading) return <div className="p-6 text-muted-foreground">Cargando terminales...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Terminales</h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">Terminales terrestres registrados.</p>
        </div>
        {!isAdminTerminal && (
          <Button onClick={openCreate}>
            <PlusIcon className="size-4 mr-1" /> Nuevo Terminal
          </Button>
        )}
      </div>
      <TerminalesTable data={data} onEdit={openEdit} onDelete={confirmDelete} />

      {modal && (
        <Dialog open onOpenChange={(o) => { if (!o) setModal(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{modal === 'create' ? 'Nuevo Terminal' : 'Editar Terminal'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium">Departamento</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedDept}
                  onChange={(e) => { setSelectedDept(e.target.value); setSelectedProv(''); setForm({ ...form, idDistrito: '' }); }}
                >
                  <option value="">Seleccionar departamento</option>
                  {departamentos.map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Provincia</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedProv}
                  onChange={(e) => { setSelectedProv(e.target.value); setForm({ ...form, idDistrito: '' }); }}
                  disabled={!selectedDept}
                >
                  <option value="">Seleccionar provincia</option>
                  {provincias.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Distrito</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.idDistrito}
                  onChange={(e) => setForm({ ...form, idDistrito: e.target.value })}
                  disabled={!selectedProv}
                >
                  <option value="">Seleccionar distrito</option>
                  {distritos.map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Dirección</label>
                <Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
              </div>
            </div>
            <DialogFooter showCloseButton>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteId && (
        <Dialog open onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">¿Estás seguro de eliminar este terminal? Esta acción no se puede deshacer.</p>
            <DialogFooter showCloseButton>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? 'Eliminando...' : 'Eliminar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
