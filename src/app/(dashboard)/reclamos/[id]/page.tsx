'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks';
import { ArrowLeft, Send, User } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea/textarea';
import { reclamoRepository, usuarioRepository } from '@/infrastructure/repositories';
import type { MensajeReclamo, Reclamo } from '@/infrastructure/domain/types';

const ESTADO_VARIANT: Record<string, 'warning' | 'info' | 'success'> = {
  abierto: 'warning',
  en_proceso: 'info',
  resuelto: 'success',
};

export default function ReclamoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { userId } = useUserRole();
  const currentUserId = userId ? Number(userId) : 1;
  const [reclamo, setReclamo] = useState<Reclamo | null>(null);
  const [mensajes, setMensajes] = useState<MensajeReclamo[]>([]);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    Promise.all([
      reclamoRepository.getById(params.id),
      reclamoRepository.listMensajes(params.id),
    ])
      .then(async ([r, msgs]) => {
        setReclamo(r);
        setMensajes(msgs);
        const ids = [...new Set(msgs.map((m) => m.idUsuario))];
        const entries = await Promise.all(
          ids.map(async (id) => {
            try {
              const u = await usuarioRepository.getById(id);
              return [id, u?.email ?? `Usuario #${id}`] as const;
            } catch {
              return [id, `Usuario #${id}`] as const;
            }
          })
        );
        setUserEmails(Object.fromEntries(entries));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSend() {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      const msg = await reclamoRepository.createMensaje(params.id, {
        idUsuario: currentUserId,
        textMensaje: texto.trim(),
      });
      setMensajes((prev) => [...prev, msg]);
      setTexto('');
    } catch (e) {
      console.error(e);
    } finally {
      setEnviando(false);
    }
  }

  if (loading) return <div className="p-6 text-muted-foreground">Cargando reclamo...</div>;
  if (!reclamo) return <div className="p-6 text-muted-foreground">Reclamo no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" onClick={() => router.push('/reclamos')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{reclamo.motivo}</h1>
          <p className="text-sm text-muted-foreground">Reclamo #{params.id}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[reclamo.estado] || 'neutral'}>{reclamo.estado}</Badge>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <p className="text-sm text-neutral-700 whitespace-pre-wrap">{reclamo.detalle}</p>
        <p className="text-xs text-neutral-400 mt-3">
          {new Date(reclamo.fechaCreacion).toLocaleString('es-PE')}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-neutral-900 mb-4">
          Mensajes ({mensajes.length})
        </h2>

        <div className="space-y-3 mb-6">
          {mensajes.map((m) => (
            <div key={m.id} className="flex gap-3 bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center justify-center size-8 rounded-full bg-blue-100 text-blue-600 shrink-0 mt-0.5">
                <User className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-neutral-500">{userEmails[m.idUsuario] ?? `Usuario #${m.idUsuario}`}</span>
                  <span className="text-xs text-neutral-400">
                    {new Date(m.fecha).toLocaleString('es-PE')}
                  </span>
                </div>
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">{m.textMensaje}</p>
              </div>
            </div>
          ))}
          {mensajes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay mensajes en este reclamo.
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Textarea
            className="flex-1 min-h-[80px]"
            placeholder="Escribir respuesta..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <Button className="self-end" onClick={handleSend} disabled={enviando || !texto.trim()}>
            <Send className="size-4" />
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}
