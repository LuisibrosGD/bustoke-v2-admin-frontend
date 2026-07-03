import { type NavItem } from '@/components/layout/nav-main';
import {
  BarChart3,
  Building2,
  Bus,
  Route,
  Map,
  MapPin,
  Ticket,
  Users,
  FileSpreadsheet,
  FileText,
  LifeBuoy,
  CircleDollarSign,
  CreditCard,
  Key,
  Settings,
} from 'lucide-react';

export const PATHS = {
  dashboardPage: '/dashboard',

  // Agencias
  agenciasPage: '/agencias',
  agenciaDetailPage: (id: string) => `/agencias/${id}`,
  agenciaEditPage: (id: string) => `/agencias/${id}/editar`,

  // Terminales
  terminalesPage: '/terminales',
  terminalDetailPage: (id: string) => `/terminales/${id}`,
  terminalEditPage: (id: string) => `/terminales/${id}/editar`,

  // Flota (Buses)
  flotaPage: '/flota',
  flotaDetailPage: (id: string) => `/flota/${id}`,
  flotaEditPage: (id: string) => `/flota/${id}/editar`,

  // Rutas
  rutasPage: '/rutas',
  rutaDetailPage: (id: string) => `/rutas/${id}`,
  rutaEditPage: (id: string) => `/rutas/${id}/editar`,

  // Viajes
  viajesPage: '/viajes',
  viajeDetailPage: (id: string) => `/viajes/${id}`,
  viajeEditPage: (id: string) => `/viajes/${id}/editar`,

  // Boletos / Pasajeros
  boletosPage: '/boletos',
  boletoDetailPage: (id: string) => `/boletos/${id}`,
  pasajerosPage: '/pasajeros',

  // Manifiesto SUTRAN
  manifiestosPage: '/manifiesto-sutran',

  // Reclamos
  reclamosPage: '/reclamos',

  // Soporte
  soportePage: '/soporte',
  soporteTicketPage: (id: string) => `/soporte/${id}`,

  // Comisiones y Liquidaciones
  comisionesPage: '/comisiones',

  // Suscripciones
  suscripcionesPage: '/suscripciones',

  // API Keys
  apiKeysPage: '/configuracion/api-keys',

  // Configuración
  configuracionPage: '/configuracion',

  // Reportes
  reportsPage: '/reportes-y-analitica',
  reportDetailPage: (slug: string) => `/reportes-y-analitica/${slug}`,

  // Auth pages (keep as-is)
  signInPage: '/iniciar-sesion',
  recoverEmailPage: '/recuperar-correo',
  emailReviewPage: '/revisar-correo',
  resetPasswordPage: '/restablecer-contrasena',
  resetPasswordReadyPage: '/restablecer-contrasena/listo',
} as const;

export const NAV_ITEMS: NavItem[] = [
  { title: 'Inicio', url: PATHS.dashboardPage, icon: BarChart3 },
  { title: 'Agencias', url: PATHS.agenciasPage, icon: Building2 },
  { title: 'Terminales', url: PATHS.terminalesPage, icon: MapPin },
  { title: 'Flota', url: PATHS.flotaPage, icon: Bus },
  { title: 'Rutas', url: PATHS.rutasPage, icon: Route },
  { title: 'Viajes', url: PATHS.viajesPage, icon: Map },
  { title: 'Boletos', url: PATHS.boletosPage, icon: Ticket },
  { title: 'Pasajeros', url: PATHS.pasajerosPage, icon: Users },
  { title: 'Manifiesto SUTRAN', url: PATHS.manifiestosPage, icon: FileSpreadsheet },
  { title: 'Reclamos', url: PATHS.reclamosPage, icon: FileText },
  { title: 'Soporte', url: PATHS.soportePage, icon: LifeBuoy },
  { title: 'Comisiones', url: PATHS.comisionesPage, icon: CircleDollarSign },
  { title: 'Suscripciones', url: PATHS.suscripcionesPage, icon: CreditCard },
  { title: 'API Keys', url: PATHS.apiKeysPage, icon: Key },
  {
    title: 'Reportes',
    url: PATHS.reportsPage,
    icon: BarChart3,
    children: [
      { title: 'Reporte de ventas', url: PATHS.reportDetailPage('ventas') },
      { title: 'Reporte de viajes', url: PATHS.reportDetailPage('viajes') },
      { title: 'Reporte financiero', url: PATHS.reportDetailPage('financiero') },
    ],
  },
  { title: 'Configuración', url: PATHS.configuracionPage, icon: Settings },
];
