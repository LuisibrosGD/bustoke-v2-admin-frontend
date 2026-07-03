'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, History, RefreshCw } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { soporteRepository } from '@/infrastructure/repositories';
import type { HistorialCambioSoporte, TicketSoporte } from '@/infrastructure/domain/types';

const ESTADO_VARIANT: Record<string, 'warning' | 'info' | 'success'> = {
  abierto: 'warning',
  en_revision: 'info',
  resuelto: 'success',
};

export default function SoporteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketSoporte | null>(null);
  const [historial, setHistorial] = useState<HistorialCambioSoporte[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    soporteRepository.getById(params.id)
      .then(setTicket)
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch(`/api/admin/soporte/${params.id}/historial`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setHistorial)
      .catch(() => setHistorial([]));
  }, [params.id]);

  if (loading) return <div className="p-6 text-muted-foreground">Cargando ticket...</div>;
  if (!ticket) return <div className="p-6 text-muted-foreground">Ticket no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" onClick={() => router.push('/soporte')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{ticket.asunto}</h1>
          <p className="text-sm text-muted-foreground">Ticket #{params.id}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[ticket.estado] || 'neutral'}>{ticket.estado}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-neutral-900 mb-3">Descripción</h2>
          <p className="text-sm text-neutral-700 whitespace-pre-wrap">{ticket.descripcion}</p>
          <p className="text-xs text-neutral-400 mt-4">
            Creado: {new Date(ticket.fechaCreacion).toLocaleString('es-PE')}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="size-4 text-neutral-500" />
            <h2 className="text-base font-semibold text-neutral-900">Historial</h2>
          </div>
          {historial.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Sin cambios registrados</p>
          ) : (
            <div className="space-y-3">
              {historial.map((h) => (
                <div key={h.id} className="flex gap-3 bg-neutral-50 rounded-lg p-3">
                  <div className="flex items-center justify-center size-7 rounded-full bg-blue-100 text-blue-600 shrink-0 mt-0.5">
                    <RefreshCw className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-neutral-500">
                      {h.fechaCambio ? new Date(h.fechaCambio).toLocaleString('es-PE') : ''}
                    </p>
                    <div className="mt-1 text-xs leading-relaxed">
                      <span className="font-medium text-neutral-700">{h.campo}</span>
                      {h.valorAnterior && (
                        <span className="text-neutral-400">
                          {' '}
                          <span className="line-through">{h.valorAnterior}</span>
                        </span>
                      )}
                      <span className="text-neutral-600"> → {h.valorNuevo}</span>
                    </div>
                    {h.idUsuarioModifica && (
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Usuario #{h.idUsuarioModifica}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
