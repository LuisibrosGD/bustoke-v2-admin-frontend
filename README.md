# Bustoke Admin Panel

Panel de administración de la plataforma Bustoke, un SaaS multi-tenant para empresas de transporte interprovincial en Perú.

## Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **UI:** Tailwind CSS 4 + Radix UI + shadcn + `lucide-react`
- **Auth:** NextAuth.js (Credentials Provider, estrategia JWT)
- **Forms/validación:** React Hook Form + Zod
- **Tablas:** TanStack Table
- **Gráficos:** Recharts
- **HTTP:** proxy BFF vía `middleware.ts` (inyecta el token server-side) + Axios en Server Actions
- **Testing:** Playwright (E2E)

## Requisitos

- Node.js 20+
- El backend ([`bustoke-admin-backend`](../bustoke-admin-backend)) corriendo en `http://localhost:5000`

## Inicio rápido

```bash
# 1. Levantar el backend FastAPI (en su propio repo) en el puerto 5000
#    Ver bustoke-admin-backend/README.md

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (ver más abajo) en .env.local

# 4. Iniciar Next.js
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Roles y control de acceso (RBAC)

El sistema tiene tres niveles de acceso. La restricción de datos se aplica **en el backend**; el frontend solo ajusta la UI (menú, botones) por conveniencia.

| Rol | Alcance | Puede ver |
|---|---|---|
| `superadmin` | Todo el sistema | Todas las agencias y su configuración global |
| `admin_agencia` | Una agencia | Solo los datos de su empresa |
| `admin_terminal` | Un terminal dentro de su agencia | Solo viajes/boletos/pasajeros cuyo terminal (origen o destino) es el suyo |

- El menú lateral se filtra por rol (un `admin_terminal` solo ve Inicio, Terminales, Rutas, Viajes, Boletos, Pasajeros y Manifiesto SUTRAN).
- La gestión de usuarios permite a un `superadmin` crear cualquier rol y a un `admin_agencia` crear encargados de terminal (`admin_terminal`) dentro de su propia agencia.

## Funcionalidades principales

- **Dashboard personalizado por rol:** encabezado y KPIs que cambian según el rol (un `admin_terminal` ve "Viajes hoy" y "Check-ins pendientes" en vez de métricas globales).
- **Carga masiva desde Excel** (Rutas, Flota, Choferes): sube un `.xlsx`, descarga la plantilla oficial y ve el resultado con éxitos/omitidos/errores por fila. El diálogo muestra la estructura de columnas esperada.
- **Gestión de usuarios** (`superadmin` / `admin_agencia`) y **gestión de choferes** con CRUD completo.
- **Buscador global** (Cmd/Ctrl+K) con resultados scopeados por rol.
- **Tablas con filtros y paginación:** Boletos (estado, ruta, rango de fechas), Viajes (estado, rango de fechas) y Pasajeros paginan del lado del cliente sobre el conjunto cargado.
- **Drill-down jerárquico** desde Agencias: `Agencias → Flota / Rutas → Viajes`.

## Arquitectura de API

```
Browser ──> /api/auth/*  ──> NextAuth (sesión JWT)
Browser ──> /api/admin/* ──> middleware.ts (inyecta Bearer token) ──> Backend FastAPI
Server  ──> Server Actions ─> Axios (server-http-client) ────────────> Backend FastAPI
```

- Las peticiones `/api/admin/*` pasan por `src/middleware.ts`, que valida la sesión y agrega el token de acceso server-side (el token nunca queda expuesto al cliente).
- `/api/auth/*` lo maneja NextAuth.
- Las Server Actions (p. ej. la carga masiva de Excel) usan `src/lib/http/server-http-client.ts`.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_URL_API` | URL del backend FastAPI | `http://localhost:5000` |
| `NEXTAUTH_SECRET` | Secreto para firmar la sesión de NextAuth | — |
| `NEXTAUTH_URL` | URL de la app | `http://localhost:3000` |

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia Next.js en modo desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Inicia servidor de producción |
| `npm run lint` | Linter ESLint |
| `npm run typecheck` | Chequeo de tipos (`tsc --noEmit`) |
| `npm run format` | Formatear con Prettier |
| `npm run test:e2e` | Tests E2E con Playwright |
| `npm run test:e2e:ui` | Playwright en modo UI |
| `npm run test:e2e:report` | Ver el último reporte de Playwright |

## Tests E2E

Los tests viven en `e2e/` y usan Playwright con proyectos de autenticación por rol (`e2e/global.setup.ts`). Las credenciales de prueba se leen de `.env.test` (gitignored).

```bash
# Reutilizar un dev server ya corriendo en vez de levantar uno nuevo
E2E_SKIP_WEBSERVER=1 npm run test:e2e
```

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/            # Páginas públicas (login, recuperar contraseña)
│   └── (dashboard)/       # Páginas protegidas del panel
├── components/            # Componentes UI (shadcn) y de layout
│   ├── ui/               # Primitivos reutilizables
│   ├── layout/           # Sidebar, header, buscador global
│   └── shared/           # Componentes compartidos (carga masiva, date pickers, etc.)
├── features/             # Módulos por funcionalidad (auth, viajes, boletos, ...)
├── hooks/                # Hooks reutilizables (useUserRole, useClientPagination, ...)
├── infrastructure/
│   ├── domain/           # Tipos del dominio
│   └── repositories/     # Clientes de datos por entidad
├── lib/                  # Utilidades, constantes, Server Actions
├── stores/               # Estado global (Zustand)
├── types/                # Tipos globales (next-auth, etc.)
└── middleware.ts         # Proxy BFF + protección de rutas
```

## Convenciones

- Conventional commits (`feat:`, `fix:`, `chore:`, etc.)
- Prettier para formateo
- Husky + lint-staged en pre-commit
