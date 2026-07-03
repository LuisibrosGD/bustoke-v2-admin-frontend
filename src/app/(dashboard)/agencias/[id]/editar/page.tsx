'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
import { Separator } from '@/components/ui/separator/separator';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { agenciaRepository } from '@/infrastructure/repositories';
import type { Agencia, EstadoAgencia } from '@/infrastructure/domain/types';

const estados: { value: EstadoAgencia; label: string }[] = [
  { value: 'activa', label: 'Activa' },
  { value: 'suspendida', label: 'Suspendida' },
];

export default function EditarAgenciaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [agencia, setAgencia] = useState<Agencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [razonSocial, setRazonSocial] = useState('');
  const [ruc, setRuc] = useState('');
  const [bancoNombre, setBancoNombre] = useState('');
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const [cuentaCci, setCuentaCci] = useState('');
  const [estado, setEstado] = useState<EstadoAgencia>('activa');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const a = await agenciaRepository.getById(params.id);
        if (!a) { setLoading(false); return; }
        setAgencia(a);
        setRazonSocial(a.razonSocial);
        setRuc(a.ruc);
        setBancoNombre(a.bancoNombre ?? '');
        setNumeroCuenta(a.numeroCuenta ?? '');
        setCuentaCci(a.cuentaCci ?? '');
        setEstado(a.estado);
      } catch {}
      setLoading(false);
    })();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agencia) return;
    setSubmitting(true);
    try {
      await agenciaRepository.update(agencia.id, {
        razonSocial,
        ruc,
        bancoNombre: bancoNombre || null,
        numeroCuenta: numeroCuenta || null,
        cuentaCci: cuentaCci || null,
        estado,
      });
      toast.success('Agencia actualizada correctamente');
      router.push(`/agencias/${params.id}`);
    } catch {
      toast.error('Error al actualizar la agencia');
    }
    setSubmitting(false);
  }

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Cargando...</div>;
  }

  if (!agencia) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Agencia no encontrada
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" asChild>
          <Link href={`/agencias/${params.id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Editar Agencia</h1>
          <p className="text-sm text-muted-foreground">Modifica los datos de la agencia</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-8">
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-900">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="razonSocial">Razón Social</Label>
              <Input id="razonSocial" value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC</Label>
              <Input id="ruc" value={ruc} onChange={(e) => setRuc(e.target.value)} />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-900">Datos Bancarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="banco">Banco</Label>
              <Input id="banco" value={bancoNombre} onChange={(e) => setBancoNombre(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numeroCuenta">N° Cuenta</Label>
              <Input id="numeroCuenta" value={numeroCuenta} onChange={(e) => setNumeroCuenta(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuentaCci">CCI</Label>
              <Input id="cuentaCci" value={cuentaCci} onChange={(e) => setCuentaCci(e.target.value)} />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-900">Estado</h2>
          <div className="flex flex-wrap gap-2">
            {estados.map((e) => (
              <button
                key={e.value}
                type="button"
                onClick={() => setEstado(e.value)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                  estado === e.value
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href={`/agencias/${params.id}`}>Cancelar</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          <Save className="size-4" />
          {submitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
