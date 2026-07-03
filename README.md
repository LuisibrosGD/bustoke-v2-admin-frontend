# Bustoke Admin Panel

Panel de administración para la plataforma de gestión de flotas Bustoke.

## Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** Tailwind CSS 4 + Radix UI + Base UI
- **Auth:** NextAuth.js (Credentials Provider con JWT)
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios (server-side) + Next.js Rewrites (client-side)
- **Real-time:** Socket.IO
- **Testing:** Playwright (E2E)

## Requisitos

- Node.js 20+
- npm

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar mock server (API simulada, TypeScript con tsx)
npm run mock-server

# 3. En otra terminal, iniciar Next.js
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Mock Server

El proyecto incluye un mock server (`mock-server.ts`) que simula la API REST. Se ejecuta en `http://localhost:5000`.

Datos obtenidos de `src/infrastructure/mock/data.ts` (fuente de verdad única).

### Usuarios de prueba

| Email | Rol | Contraseña |
|---|---|---|
| admin.cruz@cruzdelsur.com.pe | admin_agencia | password123 |
| admin.oltursa@oltursa.com.pe | admin_agencia | password123 |
| admin.civa@civa.com.pe | admin_agencia | password123 |
| admin.movil@movilbus.com.pe | admin_agencia | password123 |
| sebastian.admin@bustoke.pe | superadmin | password123 |

### Endpoints disponibles

**Auth:**
- `POST /admin/auth/login` — Iniciar sesión
- `POST /admin/auth/refresh` — Refrescar token
- `POST /admin/auth/logout` — Cerrar sesión
- `POST /admin/auth/recover-email` — Recuperar email
- `POST /admin/auth/reset-password` — Restablecer contraseña
- `POST /admin/auth/forgot-password` — Olvidé contraseña

**CRUD (GET lista / GET por id):**
- `/admin/agencias` — Agencias de transporte
- `/admin/flota` — Buses registrados
- `/admin/viajes` — Viajes programados
- `/admin/rutas` — Rutas disponibles
- `/admin/asientos?busId=` — Asientos por bus
- `/admin/viajes/:id/boletos` — Boletos de un viaje
- `/admin/viajes/:id/pasajeros` — Pasajeros de un viaje
- `/admin/liquidaciones` — Liquidaciones
- `/admin/api-keys` — API keys
- `/admin/terminales` — Terminales terrestres
- `/admin/suscripciones` — Planes de suscripción
- `/admin/soporte` — Tickets de soporte
- `/admin/reclamos` — Reclamos y quejas

**Reportes:**
- `GET /reports/ventas` — Reporte de ventas
- `GET /reports/viajes` — Reporte de viajes
- `GET /reports/manifiesto-sutran` — Manifiesto SUTRAN
- `GET /reports/:slug/export` — Exportar a Excel (simulado)

**Ubigeo:**
- `GET /ubigeo/departments` — Departamentos
- `GET /ubigeo/provinces/:departmentId` — Provincias
- `GET /ubigeo/districts/:provinceId` — Distritos

## Drill-down por jerarquía

La página **Agencias** funciona como hub de exploración jerárquica:

```
Agencias → Flota → Rutas / Horarios → Viajes
```

- Cada fila tiene un botón de **navegación** (→) para bajar al siguiente nivel y un botón de **lápiz** para editar.
- Un **breadcrumb** en la parte superior muestra la ruta actual y permite volver a niveles anteriores.
- **Superadmin**: ve todas las agencias y puede navegar sin restricciones.
- **Admin agencia**: ve solo los datos de su propia agencia.
- Cada tabla muestra solo el contexto hijo filtrado por el padre seleccionado.
- Los formularios de edición se abren en un **drawer lateral** (Sheet) con campos completos para cada entidad.

### Niveles de navegación

| Nivel | Descripción | Filtro |
|---|---|---|
| Agencias | Lista de agencias de transporte | — |
| Flota | Buses de la agencia seleccionada | `idAgencia` |
| Rutas | Rutas de la agencia seleccionada | `idAgencia` |
| Horarios | Horarios del bus seleccionado | `idBus` |
| Viajes | Viajes de la ruta seleccionada | `idRuta` |

### Columnas de acciones

Cada tabla incluye una columna `Acciones` al extremo derecho con:
- **Ver (ojo)** — abre detalle completo en un drawer
- **Editar (lápiz)** — abre formulario de edición en un drawer
- **Navegar (flecha)** — baja al siguiente nivel jerárquico (solo en el hub de agencias)

## Arquitectura de API

```
Browser ───> /api/auth/* ──> NextAuth ──> Mock Server (localhost:5000)
Browser ───> /api/* ──────> Rewrite ───> Mock Server (localhost:5000)
Server-side ──────────────> Axios ─────> Mock Server (localhost:5000)
```

- Las rutas `/api/auth/*` son manejadas por NextAuth
- Las rutas `/api/*` se redirigen via Next.js Rewrites a `NEXT_PUBLIC_URL_API`
- El Server HTTP Client (`src/lib/http/server-http-client.ts`) usa axios con baseURL = `NEXT_PUBLIC_URL_API/api`

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `NEXT_PUBLIC_URL_API` | URL del backend API | `http://localhost:5000` |
| `NEXTAUTH_SECRET` | Secreto JWT para NextAuth | — |
| `NEXTAUTH_URL` | URL de la app | `http://localhost:3000` |

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia Next.js en modo desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Inicia servidor de producción |
| `npm run lint` | Linter ESLint |
| `npm run format` | Formatear código con Prettier |
| `npm run mock-server` | Inicia mock API server |
| `npm run test:e2e` | Tests E2E con Playwright |

## Estructura del proyecto

```
src/
├── app/                    # App Router (páginas y API routes)
│   ├── (auth)/            # Páginas públicas (login, recuperar)
│   └── (dashboard)/       # Páginas protegidas del panel
├── components/            # Componentes UI reutilizables
├── features/             # Módulos por funcionalidad
│   ├── auth/             # Autenticación (NextAuth options, endpoints, store)
│   ├── reports/          # Reportes
│   └── ...
├── lib/                  # Utilidades compartidas
│   ├── constants/        # Constantes (env, endpoints, etc.)
│   └── http/             # Cliente HTTP (server-http-client)
├── providers/            # Providers de React (Theme, Session, etc.)
└── styles/               # Estilos globales
```

## Convenciones

- Convencional commits (`feat:`, `fix:`, `chore:`, etc.)
- Prettier para formateo automático
- Husky + lint-staged para hooks de pre-commit
