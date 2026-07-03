'use client';

import { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { Badge, Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { manifiestoRepository } from '@/infrastructure/repositories';
import type { ManifiestoSutran } from '@/infrastructure/domain/types';

const ESTADO_VARIANT: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
  enviado: 'success',
  pendiente: 'warning',
  error: 'danger',
};

export default function ManifiestoSutranPage() {
  const [data, setData] = useState<ManifiestoSutran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    manifiestoRepository.list()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter((m) =>
    [m.id, m.idViaje, m.estadoEnvio].some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <div className="p-6 text-muted-foreground">Cargando manifiestos...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Manifiesto SUTRAN</h1>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          Gestión de manifiestos de pasajeros para la Superintendencia de Transporte.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="relative max-w-sm mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar manifiesto..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Viaje</TableHead>
              <TableHead>Fecha generacion</TableHead>
              <TableHead>Estado envio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium text-neutral-900">{m.idViaje}</TableCell>
                <TableCell>{new Date(m.fechaGeneracion).toLocaleDateString('es-PE')}</TableCell>
                <TableCell>
                  <Badge variant={ESTADO_VARIANT[m.estadoEnvio] || 'neutral'}>{m.estadoEnvio}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon-sm">
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No se encontraron manifiestos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
