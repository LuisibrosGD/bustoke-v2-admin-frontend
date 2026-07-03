'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Pencil, Trash2, X, Check, Bus } from 'lucide-react';
import { Badge, Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { planRepository } from '@/infrastructure/repositories';
import type { Plan } from '@/infrastructure/domain/types';

export default function PlanesPage() {
  const router = useRouter();
  const [data, setData] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [editBuses, setEditBuses] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newPrecio, setNewPrecio] = useState('');
  const [newBuses, setNewBuses] = useState('');

  useEffect(() => {
    planRepository.list()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpdate(id: string) {
    const precio = parseFloat(editPrecio);
    const limiteBuses = parseInt(editBuses);
    if (!editNombre.trim() || isNaN(precio) || precio <= 0 || isNaN(limiteBuses) || limiteBuses <= 0) return;
    await planRepository.update(id, { nombre: editNombre.trim(), precio, limiteBuses });
    setData((prev) => prev.map((p) => (p.id === id ? { ...p, nombre: editNombre.trim(), precio, limiteBuses } : p)));
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    await planRepository.delete(id);
    setData((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleCreate() {
    const precio = parseFloat(newPrecio);
    const limiteBuses = parseInt(newBuses);
    if (!newNombre.trim() || isNaN(precio) || precio <= 0 || isNaN(limiteBuses) || limiteBuses <= 0) return;
    const created = await planRepository.create({ nombre: newNombre.trim(), precio, limiteBuses });
    setData((prev) => [...prev, created]);
    setShowCreate(false);
    setNewNombre('');
    setNewPrecio('');
    setNewBuses('');
  }

  if (loading) return <div className="p-6 text-muted-foreground">Cargando planes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" onClick={() => router.push('/suscripciones')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Planes de Suscripci&oacute;n</h1>
          <p className="text-sm text-muted-foreground">Administraci&oacute;n de planes SaaS disponibles</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          Nuevo Plan
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Precio mensual</TableHead>
              <TableHead>L&iacute;mite de buses</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((p) => (
              <TableRow key={p.id}>
                {editingId === p.id ? (
                  <>
                    <TableCell>
                      <Input className="h-8 text-sm" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} autoFocus />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-neutral-400">S/</span>
                        <Input type="number" step="0.01" className="w-20 h-8 text-sm" value={editPrecio} onChange={(e) => setEditPrecio(e.target.value)} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Bus className="size-3.5 text-neutral-400" />
                        <Input type="number" className="w-16 h-8 text-sm" value={editBuses} onChange={(e) => setEditBuses(e.target.value)} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" onClick={() => handleUpdate(p.id)}>
                          <Check className="size-4 text-emerald-600" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="size-4 text-neutral-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-medium text-neutral-900">{p.nombre}</TableCell>
                    <TableCell>S/ {p.precio.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Bus className="size-3.5 text-neutral-400" />
                        {p.limiteBuses}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" onClick={() => { setEditingId(p.id); setEditNombre(p.nombre); setEditPrecio(String(p.precio)); setEditBuses(String(p.limiteBuses)); }}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {data.length === 0 && !showCreate && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No hay planes registrados.
                </TableCell>
              </TableRow>
            )}
            {showCreate && (
              <TableRow>
                <TableCell>
                  <Input className="h-8 text-sm" placeholder="Nombre del plan" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} autoFocus />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-neutral-400">S/</span>
                    <Input type="number" step="0.01" className="w-20 h-8 text-sm" placeholder="0.00" value={newPrecio} onChange={(e) => setNewPrecio(e.target.value)} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Bus className="size-3.5 text-neutral-400" />
                    <Input type="number" className="w-16 h-8 text-sm" placeholder="0" value={newBuses} onChange={(e) => setNewBuses(e.target.value)} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" onClick={handleCreate}>
                      <Check className="size-4" />
                      Guardar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setShowCreate(false); setNewNombre(''); setNewPrecio(''); setNewBuses(''); }}>
                      Cancelar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
