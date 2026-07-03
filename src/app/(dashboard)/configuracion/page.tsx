'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Input,
  Label,
  Separator,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { Copy, Key, Trash2 } from 'lucide-react';
import { agenciaRepository, apiKeyRepository } from '@/infrastructure/repositories';
import type { Agencia, ApiKey } from '@/infrastructure/domain/types';

export default function ConfiguracionPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    apiKeyRepository.list().then(setApiKeys).catch(() => setApiKeys([]));
    agenciaRepository.list().then(setAgencias).catch(() => setAgencias([]));
  }, []);

  const agenciasMap = useMemo(() => new Map(agencias.map((a) => [a.id, a])), [agencias]);

  async function handleCreateApiKey() {
    const idAgencia = agencias[0]?.id;
    if (!idAgencia) return;
    setCreating(true);
    try {
      const exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      await apiKeyRepository.create({ idAgencia: Number(idAgencia), token: '', fechaExpiracion: exp });
      const keys = await apiKeyRepository.list();
      setApiKeys(keys);
    } catch {}
    setCreating(false);
  }

  async function handleDeleteApiKey(id: string) {
    try {
      await apiKeyRepository.delete(id);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Configuración</h1>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          Administra la configuración general del sistema.
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList variant="line">
          <TabsTrigger value="general">Información general</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
          <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Información general</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Datos principales de la empresa.</p>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la empresa</Label>
                <Input id="nombre" value="Bustoke S.A.C." disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruc">RUC</Label>
                <Input id="ruc" value="20123456789" disabled />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" disabled>Cancelar</Button>
              <Button disabled>Guardar cambios</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seguridad" className="mt-6">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Seguridad</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Configuración de acceso y autenticación.</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="password">Cambiar contraseña</Label>
              <Input id="password" type="password" placeholder="Nueva contraseña" disabled />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">Autenticación de dos factores (2FA)</p>
                <p className="text-xs text-muted-foreground">Protege tu cuenta con un segundo factor de autenticación.</p>
              </div>
              <Switch disabled />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" disabled>Cancelar</Button>
              <Button disabled>Guardar cambios</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferencias" className="mt-6">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Preferencias</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Personalización del sistema.</p>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="zona">Zona horaria</Label>
                <Input id="zona" value="America/Lima (UTC -5)" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idioma">Idioma</Label>
                <Input id="idioma" value="Español" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moneda">Moneda</Label>
                <Input id="moneda" value="Soles (S/)" disabled />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" disabled>Cancelar</Button>
              <Button disabled>Guardar cambios</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="mt-6">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">API Keys</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Claves para integraciones externas.</p>
              </div>
              <Button onClick={handleCreateApiKey} disabled={creating}>
                <Key className="size-4" />
                {creating ? 'Creando...' : 'Crear API Key'}
              </Button>
            </div>
            <Separator />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agencia</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>Último uso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium text-neutral-900">{agenciasMap.get(k.idAgencia)?.razonSocial ?? k.idAgencia}</TableCell>
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
                        <Button variant="ghost" size="icon-sm" onClick={() => navigator.clipboard.writeText(k.token)}>
                          <Copy className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteApiKey(k.id)}>
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
