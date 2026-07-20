'use client';

import {
  Button,
  Input,
  Label,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';

export default function ConfiguracionPage() {
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
      </Tabs>
    </div>
  );
}
