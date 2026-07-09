'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  MapPin, Bus, Route, Map, Users, CircleDollarSign,
  ArrowUpRight, Clock, AlertTriangle, AlertCircle, Info, Building2, ServerCrash,
} from 'lucide-react';
import {
  Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui';
import { cn } from '@/lib/utils/style';

interface KPI {
  title: string; value: string; subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string; text: string;
}

interface DashboardData {
  kpis: { title: string; value: string; subtitle: string }[];
  monthlyTrips: { month: string; viajes: number }[];
  recentActivities: { id: number; descripcion: string; estado: string; hora: string }[];
  upcomingTrips: { hora: string; origen: string; destino: string; pasajeros: number }[];
  alerts: { type: string; title: string; description: string }[];
}

const KPI_STYLES = [
  { icon: MapPin, bg: 'bg-blue-50', text: 'text-blue-600' },
  { icon: Bus, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { icon: Route, bg: 'bg-purple-50', text: 'text-purple-600' },
  { icon: Map, bg: 'bg-amber-50', text: 'text-amber-600' },
  { icon: Users, bg: 'bg-cyan-50', text: 'text-cyan-600' },
  { icon: CircleDollarSign, bg: 'bg-rose-50', text: 'text-rose-600' },
];

const alertIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  error: AlertCircle, warning: AlertTriangle, info: Info,
};

const alertStyleMap: Record<string, string> = {
  error: 'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
};

const activityBadgeMap: Record<string, 'success' | 'info' | 'warning'> = {
  'finalizado': 'success',
  'en_curso': 'info',
  'programado': 'info',
  'cancelado': 'warning',
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = session?.user?.accessToken;
  const loading = status === 'loading' || (!!token && isFetching);

  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/dashboard/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((d) => { setData(d); setError(null); })
      .catch((e) => {
        setData(null);
        setError(e instanceof Error ? e.message : 'Error desconocido');
      })
      .finally(() => setIsFetching(false));
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="h-8 w-64 bg-neutral-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-neutral-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Panel de Administracion</h1>
          <p className="mt-1 text-sm text-neutral-500">Resumen general del sistema de transporte</p>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <ServerCrash className="size-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">No se pudo cargar el panel de administración</p>
            <p className="mt-1 text-xs text-red-600">
              El servidor respondió con un error ({error}). Esto no significa que no haya datos: el servicio de métricas no está disponible en este momento. Intenta recargar la página en unos minutos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const kpis: KPI[] = (data?.kpis ?? []).map((kpi, i) => ({
    ...kpi,
    icon: KPI_STYLES[i]?.icon ?? Building2,
    bg: KPI_STYLES[i]?.bg ?? 'bg-neutral-50',
    text: KPI_STYLES[i]?.text ?? 'text-neutral-600',
  }));

  const monthlyTrips = data?.monthlyTrips ?? [];
  const recentActivities = data?.recentActivities ?? [];
  const upcomingTrips = data?.upcomingTrips ?? [];
  const alerts = data?.alerts ?? [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Panel de Administracion</h1>
        <p className="mt-1 text-sm text-neutral-500">Resumen general del sistema de transporte</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="group relative overflow-hidden rounded-xl border border-neutral-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-neutral-300"
            >
              <div className="flex items-start justify-between">
                <div className={cn('flex size-11 items-center justify-center rounded-lg', kpi.bg)}>
                  <Icon className={cn('size-5', kpi.text)} />
                </div>
                <ArrowUpRight className="size-4 text-neutral-300 transition-colors group-hover:text-neutral-400" />
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">{kpi.title}</p>
                <p className={cn('mt-1 text-2xl font-bold tracking-tight', kpi.text)}>{kpi.value}</p>
                <p className="mt-1 text-xs text-neutral-400">{kpi.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-neutral-900">Viajes por mes</h2>
          <p className="mb-4 text-xs text-neutral-500">Evolucion mensual de viajes realizados</p>
          {monthlyTrips.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
              Sin datos de viajes disponibles
            </div>
          ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrips} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="viajesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8c8c8c' }} axisLine={{ stroke: '#e5e5e5' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#8c8c8c' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '13px' }} labelStyle={{ fontWeight: 600, marginBottom: 4 }} />
                <Area type="monotone" dataKey="viajes" stroke="#3b82f6" strokeWidth={2} fill="url(#viajesGradient)" dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-neutral-900">Ultimas actividades</h2>
          <p className="mb-4 text-xs text-neutral-500">Movimientos recientes del sistema</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actividad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-neutral-700">{activity.descripcion}</p>
                      <p className="mt-0.5 text-xs text-neutral-400">{activity.hora}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={activityBadgeMap[activity.estado] ?? 'info'} className="text-xs">
                      {activity.estado}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {recentActivities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                    Sin actividades recientes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-neutral-900">Proximos viajes</h2>
          <p className="mb-4 text-xs text-neutral-500">Salidas programadas</p>
          <div className="space-y-3">
            {upcomingTrips.map((trip, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 transition-colors hover:bg-neutral-100/50">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white">
                  <Clock className="size-4 text-neutral-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-900">{trip.hora}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-400">{trip.pasajeros} pasajeros</p>
                </div>
              </div>
            ))}
            {upcomingTrips.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No hay viajes programados</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-neutral-900">Alertas</h2>
          <p className="mb-4 text-xs text-neutral-500">Notificaciones importantes del sistema</p>
          <div className="space-y-3">
            {alerts.map((alert, index) => {
              const AlertIcon = alertIconMap[alert.type] ?? Info;
              return (
                <div key={index} className={cn('flex gap-3 rounded-lg border p-3', alertStyleMap[alert.type] ?? 'bg-blue-50 border-blue-200 text-blue-700')}>
                  <AlertIcon className="mt-0.5 size-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{alert.title}</p>
                    <p className="mt-0.5 text-xs opacity-80">{alert.description}</p>
                  </div>
                </div>
              );
            })}
            {alerts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Sin alertas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
