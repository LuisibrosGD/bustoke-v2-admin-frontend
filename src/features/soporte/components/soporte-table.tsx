'use client';

import { useMemo, useState } from 'react';
import { useUserRole } from '@/hooks';
import { Input, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Label } from '@/components/ui';
import { SearchIcon, Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { useSoporteColumns } from './soporte-columns';
import { soporteRepository } from '@/infrastructure/repositories';
import type { TicketSoporte } from '@/infrastructure/domain/types';

interface Props { data: TicketSoporte[]; onRefresh: () => void }

export function SoporteTable({ data, onRefresh }: Props) {
  const { idAgencia, isSuperadmin } = useUserRole();

  const [s, setS] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const f = useMemo(() => {
    if (!s) return data;
    const l = s.toLowerCase();
    return data.filter((t) => t.asunto.toLowerCase().includes(l) || t.idAgencia.includes(l));
  }, [data, s]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este ticket de soporte?')) return;
    try {
      await soporteRepository.delete(id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    if (!asunto.trim() || !descripcion.trim()) return;
    setSubmitting(true);
    try {
      await soporteRepository.create({
        idAgencia: idAgencia || '',
        asunto: asunto.trim(),
        descripcion: descripcion.trim(),
      });
      setDialogOpen(false);
      setAsunto('');
      setDescripcion('');
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useSoporteColumns({ isSuperadmin, onDelete: handleDelete, onRefresh });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar ticket..." className="pl-9" value={s} onChange={(e) => setS(e.target.value)} />
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4 mr-1" />
          Nuevo ticket
        </Button>
      </div>
      <DataTable columns={columns} data={f} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo ticket de soporte</DialogTitle>
            <DialogDescription>Describe el problema que reportas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Asunto</Label>
              <Input value={asunto} onChange={(e) => setAsunto(e.target.value)} placeholder="Ej: Problema con el módulo de ventas" />
            </div>
            <div className="space-y-1">
              <Label>Descripción</Label>
              <textarea
                className="flex w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 min-h-[100px]"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el problema en detalle..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={submitting || !asunto.trim() || !descripcion.trim()}>
              {submitting ? 'Creando...' : 'Crear ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
