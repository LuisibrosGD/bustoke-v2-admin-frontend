'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserRole } from '@/hooks';
import {
  Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Input, Label,
} from '@/components/ui';
import { Copy, Key, Trash2, Plus } from 'lucide-react';
import { apiKeyRepository, agenciaRepository } from '@/infrastructure/repositories';
import type { ApiKey, Agencia } from '@/infrastructure/domain/types';

export default function ApiKeysPage() {
  const [data, setData] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [selectedAgencia, setSelectedAgencia] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  const { role, idAgencia, isSuperadmin, isLoading: sessionLoading } = useUserRole();

  const loadApiKeys = useCallback(() => {
    setLoading(true);
    const params = role === 'admin_agencia' && idAgencia ? { id_agencia: idAgencia } : undefined;
    apiKeyRepository.list(params)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, [role, idAgencia]);

  useEffect(() => {
    if (sessionLoading) return;
    loadApiKeys();
  }, [sessionLoading, loadApiKeys]);

  useEffect(() => {
    if (!isSuperadmin || !dialogOpen) return;
    agenciaRepository.list().then(setAgencias).catch(console.error);
  }, [isSuperadmin, dialogOpen]);

  async function handleCopy(token: string) {
    await navigator.clipboard.writeText(token);
    alert('Copiado');
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta API Key?')) return;
    await apiKeyRepository.delete(id);
    loadApiKeys();
  }

  async function handleCreate() {
    setSubmitting(true);
    try {
      const payload: { idAgencia: number; token: string; fechaExpiracion: string } = {
        idAgencia: isSuperadmin ? Number(selectedAgencia) : Number(idAgencia),
        token: '',
        fechaExpiracion: new Date(fechaExpiracion).toISOString(),
      };
      const created = await apiKeyRepository.create(payload);
      setCreatedToken(created.token);
      loadApiKeys();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Error al crear');
    } finally {
      setSubmitting(false);
    }
  }

  function resetDialog() {
    setDialogOpen(false);
    setSelectedAgencia('');
    setFechaExpiracion('');
    setCreatedToken(null);
  }

  if (loading) return <div className="p-6 text-muted-foreground">Cargando API Keys...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  const hideCreate = role === 'admin_agencia' && data.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">API Keys</h1>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          Gestión de claves de API para integraciones externas.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">
            Total de {data.length} claves registradas
          </p>
          {!hideCreate && (
            <Button onClick={() => setDialogOpen(true)}>
              <Key className="size-4" />
              Crear API Key
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agencia</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Vence</TableHead>
              <TableHead>Ultimo uso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((k) => (
              <TableRow key={k.id}>
                <TableCell className="font-medium text-neutral-900">{k.idAgencia}</TableCell>
                <TableCell>
                  <code className="text-xs bg-neutral-100 px-2 py-1 rounded">{k.token.slice(0, 16)}...</code>
                </TableCell>
                <TableCell>{new Date(k.fechaCreacion).toLocaleDateString('es-PE')}</TableCell>
                <TableCell>{new Date(k.fechaExpiracion).toLocaleDateString('es-PE')}</TableCell>
                <TableCell>{k.ultimoUso ? new Date(k.ultimoUso).toLocaleDateString('es-PE') : '—'}</TableCell>
                <TableCell>
                  <Badge variant={k.activo ? 'success' : 'neutral'}>{k.activo ? 'Activo' : 'Inactivo'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleCopy(k.token)}>
                      <Copy className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(k.id)}>
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay API Keys registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetDialog(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva API Key</DialogTitle>
            <DialogDescription>
              {createdToken
                ? 'La clave se ha generado. Cópiala ahora, no podrás verla después.'
                : 'Genera una nueva clave de API.'}
            </DialogDescription>
          </DialogHeader>

          {createdToken ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Token generado</Label>
                <div className="flex gap-2">
                  <Input readOnly value={createdToken} className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={() => handleCopy(createdToken)}>
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={resetDialog}>Cerrar</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              {isSuperadmin && (
                <div className="space-y-1">
                  <Label>Agencia</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
                    value={selectedAgencia}
                    onChange={(e) => setSelectedAgencia(e.target.value)}
                  >
                    <option value="">Seleccionar agencia...</option>
                    {agencias.filter((a) => !data.some((k) => String(k.idAgencia) === a.id)).map((a) => (
                      <option key={a.id} value={a.id}>{a.razonSocial}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-1">
                <Label>Fecha de expiración</Label>
                <Input type="date" value={fechaExpiracion} onChange={(e) => setFechaExpiracion(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetDialog}>Cancelar</Button>
                <Button
                  onClick={handleCreate}
                  disabled={submitting || !fechaExpiracion || (isSuperadmin && !selectedAgencia)}
                >
                  {submitting ? 'Creando...' : <><Plus className="size-4" /> Crear</>}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
