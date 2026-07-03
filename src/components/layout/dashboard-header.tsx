'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Bell, Menu, X } from 'lucide-react';
import { useSidebar, Input, Avatar, AvatarFallback, Button } from '@/components/ui';
import { useSession } from 'next-auth/react';
import { notificacionRepository } from '@/infrastructure/repositories';
import type { Notificacion } from '@/infrastructure/domain/types';

export function DashboardHeader() {
  const { toggleSidebar } = useSidebar();
  const { data: session } = useSession();
  const [noLeidas, setNoLeidas] = useState(0);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [openPanel, setOpenPanel] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const { total } = await notificacionRepository.contarNoLeidas();
      setNoLeidas(total);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { cargar(); const id = setInterval(cargar, 30000); return () => clearInterval(id); }, [cargar]);

  async function abrirPanel() {
    setOpenPanel((p) => !p);
    if (!openPanel) {
      try {
        const lista = await notificacionRepository.list(true);
        setNotificaciones(lista);
      } catch { /* ignore */ }
    }
  }

  async function marcarLeida(id: string) {
    try {
      await notificacionRepository.marcarLeida(id);
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
      setNoLeidas((prev) => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  }

  async function marcarTodas() {
    try {
      await notificacionRepository.marcarTodasLeidas();
      setNotificaciones([]);
      setNoLeidas(0);
    } catch { /* ignore */ }
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-white">
      <div className="flex h-full items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={toggleSidebar}
            className="flex size-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors -ml-1"
          >
            <Menu className="size-5" />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Buscar..."
              className="h-9 pl-10 bg-neutral-50 border-neutral-200 text-sm rounded-lg focus:bg-white"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={abrirPanel} className="relative flex size-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
              <Bell className="size-5" />
              {noLeidas > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center size-4.5 rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white">
                  {noLeidas > 9 ? '9+' : noLeidas}
                </span>
              )}
            </button>
            {openPanel && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-neutral-200 shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                  <h3 className="text-sm font-semibold text-neutral-900">Notificaciones</h3>
                  <div className="flex items-center gap-1">
                    {noLeidas > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={marcarTodas}>
                        Leer todas
                      </Button>
                    )}
                    <button onClick={() => setOpenPanel(false)} className="flex size-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100">
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  {notificaciones.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Sin notificaciones</p>
                  ) : (
                    notificaciones.map((n) => (
                      <button key={n.id} onClick={() => marcarLeida(n.id)} className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b border-neutral-50 last:border-0 transition-colors">
                        <p className="text-sm font-medium text-neutral-900">{n.titulo}</p>
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{n.mensaje}</p>
                        <p className="text-[11px] text-neutral-400 mt-1">{new Date(n.fechaCreacion).toLocaleString('es-PE')}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-neutral-200">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {session?.user?.name
                  ? session.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                  : 'AD'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-neutral-800">
                {session?.user?.name || 'U Admin'}
              </span>
              <span className="text-xs text-neutral-500">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
