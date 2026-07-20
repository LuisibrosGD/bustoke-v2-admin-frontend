'use client';

import { useMemo, useState } from 'react';
import { useUserRole } from '@/hooks';
import Link from 'next/link';
import { useAgencias } from '../application/use-entity-data';
import {
  DataTable,
  DataTableEmpty,
  Input,
  Badge,
  Button,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
} from '@/components/ui';
import { SearchIcon, XIcon, ArrowRight, Pencil, Eye, Plus } from 'lucide-react';
import { agenciaRepository } from '@/infrastructure/repositories';
import type { Agencia } from '@/infrastructure/domain/types';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

const estadoVariant: Record<string, 'success' | 'danger' | 'warning' | 'neutral'> = {
  activa: 'success',
  suspendida: 'warning',
};

export function AgenciaTableLevel() {
  const { isSuperadmin } = useUserRole();

  const [search, setSearch] = useState('');
  const { data, isLoading, error, refetch } = useAgencias();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!ruc.trim() || !razonSocial.trim()) return;
    setSubmitting(true);
    try {
      await agenciaRepository.create({ ruc: ruc.trim(), razonSocial: razonSocial.trim() });
      setDialogOpen(false);
      setRuc('');
      setRazonSocial('');
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al crear la agencia');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter(
      (a) =>
        a.razonSocial.toLowerCase().includes(lower) ||
        a.ruc.includes(lower)
    );
  }, [search, data]);

  const columns = useMemo<ColumnDef<Agencia>[]>(
    () => [
      {
        id: 'expand',
        header: '',
        cell: ({ row }) => (
          <Link href={`/agencias/${row.original.id}/flota`}>
            <Button variant="ghost" size="icon" className="size-8" title="Ver flota">
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        ),
      },
      {
        accessorKey: 'razonSocial',
        header: 'Razón Social',
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue('razonSocial')}</span>
        ),
      },
      { accessorKey: 'ruc', header: 'RUC' },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => (
          <Badge
            variant={estadoVariant[row.getValue('estado') as string] ?? 'neutral'}
          >
            {row.getValue('estado')}
          </Badge>
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Link href={`/agencias/${row.original.id}`}>
              <Button variant="ghost" size="icon" className="size-8" title="Ver detalle">
                <Eye className="size-4" />
              </Button>
            </Link>
            <Link href={`/agencias/${row.original.id}/editar`}>
              <Button variant="ghost" size="icon" className="size-8" title="Editar">
                <Pencil className="size-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/50 shadow-sm p-6">
        <DataTableEmpty
          title="Error al cargar"
          description={error}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 p-4 border-b border-neutral-100">
          <div className="relative w-full sm:flex-1 sm:max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Buscar por RUC o razón social..."
              className="pl-9 border-neutral-200 bg-neutral-50/50 focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <Button variant="ghost" size="sm" onClick={() => setSearch('')}>
              <XIcon className="size-4 mr-1" /> Limpiar
            </Button>
          )}
          {isSuperadmin && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="size-4 mr-1" />
              Nueva agencia
            </Button>
          )}
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          emptyElement={
            <DataTableEmpty
              title="Sin resultados"
              description="No se encontraron agencias."
            />
          }
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva agencia</DialogTitle>
            <DialogDescription>Registra una nueva empresa de transporte.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>RUC (11 dígitos)</Label>
              <Input value={ruc} onChange={(e) => setRuc(e.target.value)} placeholder="12345678901" maxLength={11} />
              {ruc.length > 0 && ruc.length !== 11 && <p className="text-xs text-red-500">El RUC debe tener 11 dígitos</p>}
            </div>
            <div className="space-y-1">
              <Label>Razón Social</Label>
              <Input value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} placeholder="Empresa de Transportes S.A.C." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={submitting || !ruc.trim() || !razonSocial.trim() || ruc.trim().length !== 11}>
              {submitting ? 'Creando...' : 'Crear agencia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
