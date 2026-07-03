'use client';

import { useState, useCallback } from 'react';
import { ViajesTable } from '@/features/viajes/components';
import { ViajeDialog } from '@/features/viajes/components/viaje-dialog';
import {
  Button,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui';
import { PlusIcon } from 'lucide-react';
import { viajeRepository } from '@/infrastructure/repositories';
import type { Viaje } from '@/infrastructure/domain/types';

export default function ViajesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingViaje, setEditingViaje] = useState<Viaje | null>(null);
  const [deletingViaje, setDeletingViaje] = useState<Viaje | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = useCallback((v: Viaje) => {
    setEditingViaje(v);
    setDialogOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((v: Viaje) => {
    setDeletingViaje(v);
    setDeleteOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    setDialogOpen(false);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingViaje) return;
    try {
      await viajeRepository.delete(deletingViaje.id);
      setDeleteOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar viaje');
    }
  }, [deletingViaje]);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Viajes</h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            Programación de viajes interprovinciales.
          </p>
        </div>
        <Button onClick={() => { setEditingViaje(null); setDialogOpen(true); }}>
          <PlusIcon className="size-4 mr-1" /> Nuevo Viaje
        </Button>
      </div>
      <ViajesTable key={refreshKey} onEdit={handleEdit} onDelete={handleDeleteRequest} />
      <ViajeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        viaje={editingViaje}
        onSave={handleSave}
      />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar viaje?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el viaje con salida{' '}
              {deletingViaje && new Date(deletingViaje.fechaHoraSalida).toLocaleString('es-PE')}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
