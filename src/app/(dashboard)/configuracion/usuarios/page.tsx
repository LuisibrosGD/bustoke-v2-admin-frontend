'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserRole } from '@/hooks';
import {
  Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Input, Label,
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui';
import { Copy, UserCog, Trash2, Plus } from 'lucide-react';
import { usuarioAdminRepository, agenciaRepository, agenciaTerminalRepository, terminalRepository } from '@/infrastructure/repositories';
import type { Usuario, Agencia, Terminal } from '@/infrastructure/domain/types';
import { toast } from 'sonner';

type RolGestionable = 'superadmin' | 'admin_agencia' | 'admin_terminal';

const ROL_LABEL: Record<string, string> = {
  superadmin: 'Superadmin',
  admin_agencia: 'Admin agencia',
  admin_terminal: 'Admin terminal',
};

const selectClass = 'flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400';

export default function UsuariosPage() {
  const { idAgencia, isSuperadmin, isLoading: sessionLoading } = useUserRole();

  const [data, setData] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [terminales, setTerminales] = useState<Terminal[]>([]);
  const [agenciaTerminales, setAgenciaTerminales] = useState<{ idAgencia: string; idTerminal: string }[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState<RolGestionable>('admin_terminal');
  const [selectedAgencia, setSelectedAgencia] = useState('');
  const [selectedTerminal, setSelectedTerminal] = useState('');
  const [activo, setActivo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);

  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const loadUsuarios = useCallback(() => {
    setLoading(true);
    usuarioAdminRepository.list()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (sessionLoading) return;
    loadUsuarios();
  }, [sessionLoading, loadUsuarios]);

  useEffect(() => {
    if (!isSuperadmin) return;
    agenciaRepository.list().then(setAgencias).catch(console.error);
  }, [isSuperadmin]);

  useEffect(() => {
    terminalRepository.list().then(setTerminales).catch(console.error);
  }, []);

  const agenciaEfectiva = isSuperadmin ? selectedAgencia : idAgencia ?? '';

  useEffect(() => {
    if (!agenciaEfectiva) {
      setAgenciaTerminales([]);
      return;
    }
    agenciaTerminalRepository.findByAgencia(agenciaEfectiva)
      .then((rows) => setAgenciaTerminales(rows.map((r) => ({ idAgencia: r.idAgencia, idTerminal: r.idTerminal }))))
      .catch(() => setAgenciaTerminales([]));
  }, [agenciaEfectiva]);

  const agenciasMap = useMemo(() => new Map(agencias.map((a) => [String(a.id), a])), [agencias]);
  const terminalesMap = useMemo(() => new Map(terminales.map((t) => [String(t.id), t])), [terminales]);

  const terminalesDisponibles = useMemo(
    () => agenciaTerminales.map((at) => terminalesMap.get(String(at.idTerminal))).filter((t): t is Terminal => !!t),
    [agenciaTerminales, terminalesMap]
  );

  function resetDialog() {
    setDialogOpen(false);
    setEditingUsuario(null);
    setEmail('');
    setTelefono('');
    setRol('admin_terminal');
    setSelectedAgencia('');
    setSelectedTerminal('');
    setActivo(true);
    setCreatedPassword(null);
  }

  function openCreate() {
    resetDialog();
    setRol(isSuperadmin ? 'admin_agencia' : 'admin_terminal');
    setDialogOpen(true);
  }

  function openEdit(u: Usuario) {
    setEditingUsuario(u);
    setTelefono(u.telefono ?? '');
    setSelectedTerminal(u.idTerminal ?? '');
    setActivo(u.activo);
    setDialogOpen(true);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      if (editingUsuario) {
        const payload: { telefono?: string; activo?: boolean; idTerminal?: string } = { telefono, activo };
        if (editingUsuario.rol === 'admin_terminal' && selectedTerminal) {
          payload.idTerminal = selectedTerminal;
        }
        await usuarioAdminRepository.update(editingUsuario.id, payload);
        toast.success('Usuario actualizado');
        resetDialog();
        loadUsuarios();
      } else {
        if (!email) {
          toast.error('Ingresa un correo');
          return;
        }
        if (rol === 'admin_terminal' && !selectedTerminal) {
          toast.error('Selecciona un terminal');
          return;
        }
        if (isSuperadmin && rol !== 'superadmin' && !selectedAgencia) {
          toast.error('Selecciona una agencia');
          return;
        }
        const created = await usuarioAdminRepository.create({
          email,
          telefono: telefono || null,
          rol,
          idAgencia: rol === 'superadmin' ? null : (isSuperadmin ? selectedAgencia : idAgencia),
          idTerminal: rol === 'admin_terminal' ? selectedTerminal : null,
        });
        setCreatedPassword(created.passwordTemporal);
        loadUsuarios();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar usuario');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  }

  function handleDeactivateRequest(id: string) {
    setDeactivatingId(id);
  }

  async function handleDeactivateConfirm() {
    if (!deactivatingId) return;
    setDeactivating(true);
    try {
      await usuarioAdminRepository.deactivate(deactivatingId);
      setDeactivatingId(null);
      loadUsuarios();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al desactivar usuario');
    } finally {
      setDeactivating(false);
    }
  }

  if (loading) return <div className="p-6 text-muted-foreground">Cargando usuarios...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Usuarios</h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            Gestión de administradores de agencia y encargados de terminal.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Nuevo usuario
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Rol</TableHead>
              {isSuperadmin && <TableHead>Agencia</TableHead>}
              <TableHead>Terminal</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((u) => {
              const canManage = isSuperadmin || u.rol === 'admin_terminal';
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-neutral-900">{u.email}</TableCell>
                  <TableCell>{u.telefono ?? '—'}</TableCell>
                  <TableCell>{ROL_LABEL[u.rol] ?? u.rol}</TableCell>
                  {isSuperadmin && (
                    <TableCell>{u.idAgencia ? agenciasMap.get(u.idAgencia)?.razonSocial ?? u.idAgencia : '—'}</TableCell>
                  )}
                  <TableCell>{u.idTerminal ? terminalesMap.get(u.idTerminal)?.nombre ?? u.idTerminal : '—'}</TableCell>
                  <TableCell>
                    <Badge variant={u.activo ? 'success' : 'neutral'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canManage && (
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(u)}>
                          <UserCog className="size-4" />
                        </Button>
                        {u.activo && (
                          <Button variant="ghost" size="icon-sm" onClick={() => handleDeactivateRequest(u.id)}>
                            <Trash2 className="size-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={isSuperadmin ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  No hay usuarios registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetDialog(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUsuario ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
            <DialogDescription>
              {createdPassword
                ? 'El usuario se creó correctamente. Comparte esta contraseña temporal, no se mostrará de nuevo.'
                : editingUsuario
                  ? 'Actualiza los datos del usuario.'
                  : 'Completa los datos para crear un nuevo administrador.'}
            </DialogDescription>
          </DialogHeader>

          {createdPassword ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Contraseña temporal</Label>
                <div className="flex gap-2">
                  <Input readOnly value={createdPassword} className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={() => handleCopy(createdPassword)}>
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={resetDialog}>Cerrar</Button>
              </DialogFooter>
            </div>
          ) : editingUsuario ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input readOnly value={editingUsuario.email} className="bg-neutral-50 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <Label>Teléfono</Label>
                <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
              {editingUsuario.rol === 'admin_terminal' && (
                <div className="space-y-1">
                  <Label>Terminal</Label>
                  <select className={selectClass} value={selectedTerminal} onChange={(e) => setSelectedTerminal(e.target.value)}>
                    <option value="">Seleccionar terminal...</option>
                    {terminalesDisponibles.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input id="activo" type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="size-4" />
                <Label htmlFor="activo">Usuario activo</Label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetDialog}>Cancelar</Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@empresa.com" />
              </div>
              <div className="space-y-1">
                <Label>Teléfono</Label>
                <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Opcional" />
              </div>
              <div className="space-y-1">
                <Label>Rol</Label>
                <select
                  className={selectClass}
                  value={rol}
                  onChange={(e) => { setRol(e.target.value as RolGestionable); setSelectedTerminal(''); }}
                  disabled={!isSuperadmin}
                >
                  {isSuperadmin && <option value="superadmin">Superadmin</option>}
                  {isSuperadmin && <option value="admin_agencia">Admin agencia</option>}
                  <option value="admin_terminal">Admin terminal</option>
                </select>
              </div>
              {isSuperadmin && rol !== 'superadmin' && (
                <div className="space-y-1">
                  <Label>Agencia</Label>
                  <select
                    className={selectClass}
                    value={selectedAgencia}
                    onChange={(e) => { setSelectedAgencia(e.target.value); setSelectedTerminal(''); }}
                  >
                    <option value="">Seleccionar agencia...</option>
                    {agencias.map((a) => (
                      <option key={a.id} value={a.id}>{a.razonSocial}</option>
                    ))}
                  </select>
                </div>
              )}
              {rol === 'admin_terminal' && (
                <div className="space-y-1">
                  <Label>Terminal</Label>
                  <select
                    className={selectClass}
                    value={selectedTerminal}
                    onChange={(e) => setSelectedTerminal(e.target.value)}
                    disabled={isSuperadmin && !selectedAgencia}
                  >
                    <option value="">Seleccionar terminal...</option>
                    {terminalesDisponibles.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={resetDialog}>Cancelar</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !email || (rol === 'admin_terminal' && !selectedTerminal) || (isSuperadmin && rol !== 'superadmin' && !selectedAgencia)}
                >
                  {submitting ? 'Creando...' : 'Crear usuario'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deactivatingId} onOpenChange={(open) => !open && setDeactivatingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar este usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              El usuario no podrá iniciar sesión hasta que se reactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateConfirm} disabled={deactivating} className="bg-red-600 hover:bg-red-700">
              {deactivating ? 'Desactivando...' : 'Desactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
