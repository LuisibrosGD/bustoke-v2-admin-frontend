# Requerimientos para el Backend — Bustoke Admin Panel

> Generado: 2026-06-28. Reemplaza por completo a `backend-requerimientos-admin.txt` (quedó desactualizado: hablaba de un mock-server que ya no existe, y de un GAP de "conductores" que ya está resuelto).
>
> Todo lo de este documento fue verificado **en vivo contra el backend real** (`https://bustoke-admin-backend.onrender.com`), no son suposiciones. Donde digo "confirmado con curl" es porque literalmente hice la petición y vi la respuesta.

---

## 0. Contrato general (cómo el frontend habla con el backend)

- **Prefijo de ruta**: todo vive bajo `/admin/...` (ej. `/admin/agencias`, `/admin/viajes`). Rutas sin ese prefijo (`/agencias`, `/dashboard/`) devuelven 404 — confirmado con curl.
- **Sin prefijo `/api`**: el navegador nunca llama al backend directo; pasa por un proxy de Next.js (`src/middleware.ts`) que recibe `/api/admin/...` y reenvía a `${BACKEND_URL}/admin/...`. Para ustedes, del lado del backend, las rutas reales son solo `/admin/...`.
- **Auth**: `Authorization: Bearer <accessToken>` en cada request a `/admin/*` (excepto login/refresh).
- **IDs**: el backend los devuelve como **number** en el JSON (ej. `"id": 1`), pero los tipos del frontend están declarados como `string`. Funciona porque el frontend castea con `String(x.id)` donde compara, pero si en algún momento cambian el tipo de ID (ej. a UUID), avísennos — hoy asumimos enteros autoincrementales.
- **Encoding**: las respuestas deben ir con UTF-8 explícito. Ver bug crítico #2 abajo.
- **Sin paginación todavía**: los listados (`GET /admin/agencias`, `/admin/viajes`, etc.) devuelven **arrays planos**, no `{ data: [], meta: {...} }`. Si van a paginar, coordinen con nosotros antes — el frontend hoy asume que recibe todo el array completo.
- **Trailing slash**: vimos que `/admin/agencias` (sin slash final) responde 307 redirigiendo a la versión con slash. Funciona, pero indica que probablemente usan FastAPI con `redirect_slashes=True`. No es necesario cambiar nada, solo lo documentamos.

---

## 1. 🔴 Bugs críticos — confirmados, hay que arreglarlos

### 1.1 `GET /admin/dashboard/` devuelve 500 Internal Server Error

Confirmado con curl directo (con token válido):
```
GET /admin/dashboard/ → 500, body: "Internal Server Error" (texto plano, ni siquiera JSON)
```
Probablemente falta una vista/query en la BD desplegada, o hay una excepción no manejada en el handler. El panel principal del admin (`/dashboard`) depende 100% de este endpoint — hoy se ve completamente vacío por esto.

**Shape que el frontend espera recibir** (definido en `src/app/(dashboard)/admin-dashboard.tsx`):
```ts
{
  kpis: { title: string; value: string; subtitle: string }[];       // ej. 6 KPIs: ventas 24h, ingresos totales, viajes activos, clientes, etc.
  monthlyTrips: { month: string; viajes: number }[];                  // para el gráfico de área "Viajes por mes"
  recentActivities: { id: number; descripcion: string; estado: string; hora: string }[];
  upcomingTrips: { hora: string; origen: string; destino: string; pasajeros: number }[];
  alerts: { type: 'error' | 'warning' | 'info'; title: string; description: string }[];
}
```

### 1.2 Encoding roto — nombres con tildes llegan corruptos

Confirmado visualmente: `GET /admin/pasajeros` devuelve nombres como `"MarÃa ChÃ¡vez GÃ³mez"` en vez de `"María Chávez Gómez"`. Es un mojibake clásico de UTF-8 mal declarado (probablemente la respuesta no trae `charset=utf-8` en el `Content-Type`, o la conexión a Postgres no está forzando `client_encoding=UTF8`).

Esto afecta cualquier campo con tildes/ñ en cualquier endpoint, no solo pasajeros — revisar de forma global, no parchar solo ese endpoint.

---

## 2. 🟡 Endpoints que faltan para features que ya construimos en el frontend

Estas features ya están **maquetadas en el admin** (UI completa, interactiva) pero no pueden persistir nada porque el endpoint no existe. El frontend ya está listo para consumirlos en cuanto existan — no debería requerir cambios de nuestro lado.

### 2.1 Editor de mapa de asientos (plantilla por bus)

Hoy `GET /admin/flota/buses/:busId/asientos` y `PUT /admin/flota/asientos/:id` (solo para `bloqueadoManual`) ya existen y funcionan. Falta:

```
POST /admin/flota/buses/:busId/asientos
  body: { numeroAsiento: string, fila: string, piso: number, tipoServicio: "vip"|"normal", coordX: number, coordY: number, bloqueadoManual: boolean }
  → 201, devuelve el Asiento creado (con id)

DELETE /admin/flota/asientos/:id
  → 200/204

PUT /admin/flota/asientos/:id
  body: { bloqueadoManual?: boolean, tipoServicio?: "vip"|"normal" }   ← AMPLIAR: hoy solo acepta bloqueadoManual
```

Convención de `numeroAsiento`/`coordX`/`coordY` (igual que ya generan en el seed de `nuevadb/scriptbd.sql`, para que el admin pueda regenerar la plantilla con el mismo criterio):
- `numeroAsiento`: `"${fila}${columna}-${piso}"`, ej. `"A1-1"`.
- `coordX`: columnas 1-2 → `columna * 20`; columnas 3-4 → `columna * 20 + 5` (deja el pasillo entre columna 2 y 3).
- `coordY`: `10 + (índiceFila * 9)` con A=0, B=1, etc.

El admin usa esto para: crear/editar la plantilla de asientos al dar de alta un bus nuevo, y para marcar qué asientos son VIP.

### 2.2 Check-in / abordaje de pasajeros (persistencia real)

La pantalla `/viajes/:id/check-in` existe y es interactiva, pero hoy **no llama a ningún endpoint** — todo vive en memoria del navegador y se pierde al refrescar. Necesitamos algo como:

```
PUT /admin/boletos/:id/check-in
  body: { idUsuarioCheckIn?: number }
  → marca el boleto como abordado, registra fecha/hora y quién lo hizo

PUT /admin/boletos/:id/no-show
  → marca el boleto como "no se presentó"
```

El modelo `Boleto` actual solo tiene `usado: boolean` y `fechaValidacion`. Si quieren reusar esos campos está bien, pero no distinguen "no abordó" de "no validado aún" — recomendamos agregar `noShow: boolean` y `idUsuarioCheckIn` si es posible.

### 2.3 Validación de QR para abordaje (escáner)

El botón "Escanear" en check-in está deshabilitado porque no hay endpoint. Necesitamos:

```
POST /admin/viajes/:id/check-in/scan
  body: { codigoQr: string }
  → devuelve el Boleto correspondiente (o 404 si el QR no es de ese viaje) para que el frontend confirme el check-in con 2.2
```

### 2.4 Historial de tickets de soporte

```
GET /admin/soporte/:id/historial
  → HistorialCambioSoporte[]: { id, idTicket, campo, valorAnterior, valorNuevo, idUsuarioModifica, fechaCambio }
```

Hoy el frontend ya llama a esta ruta (la dejamos resiliente para que no rompa la página si sigue sin existir), pero la sección de historial se queda vacía hasta que la implementen.

---

## 3. 🟢 Gaps de modelo de datos (de la auditoría anterior, todavía vigentes)

Estos ya los habíamos identificado antes de esta sesión. Los resumimos de nuevo porque siguen sin resolverse — **excepto el de conductores, que ya está resuelto** (la tabla `choferes` y `viajes.id_chofer` ya existen en `nuevadb/scriptbd.sql`, y el frontend ya permite asignar chofer al crear/editar un viaje).

| Gap | Qué falta | Prioridad |
|---|---|---|
| Documentos vehiculares | Tabla para SOAT, CIR, revisión técnica por bus, con fecha de vencimiento (el Manifiesto SUTRAN los exige) | Crítico |
| Datos de contacto de agencia | `agencias` solo tiene RUC/razón social/datos bancarios — falta dirección, teléfono, email de contacto | Importante |
| Precios por asiento individual | Hoy la tarifa es por `tipoServicio` (vip/normal) a nivel ruta; no se puede diferenciar por fila/ventana-pasillo | Importante |
| Facturación electrónica | `agencias` no tiene serie/correlativo de comprobantes | Importante |
| Frecuencias de viaje recurrentes | Hoy cada viaje se crea uno por uno; no hay modelo de "todos los días a las 8am" | Deseable |
| Notificaciones | No hay tabla de notificaciones internas (vencimientos, reclamos nuevos, etc.) | Deseable |
| Catálogos dinámicos | Enums como `tipo_servicio`, `canal_venta` están hardcodeados en el frontend; si cambian en el backend, el frontend no se entera | Importante |
| Motivo de cancelación | `Boleto`/`Viaje` no registran por qué se canceló algo ni quién lo autorizó | Importante |

---

## 4. Apéndice — endpoints confirmados funcionando hoy

Para que sepan que NO hace falta tocar estos (ya los probamos en vivo, con datos reales):

```
POST /admin/auth/login          body: {email, password} → {accessToken, refreshToken, tokenType, rol, idUsuario, idAgencia}
POST /admin/auth/refresh
POST /admin/auth/logout
POST /admin/auth/logout-session
GET  /admin/agencias
GET  /admin/agencias/:id
GET  /admin/flota/buses
GET  /admin/flota/buses/:id
GET  /admin/flota/buses/:id/asientos
PUT  /admin/flota/asientos/:id        (solo bloqueadoManual por ahora — ver 2.1)
GET  /admin/rutas
GET  /admin/viajes                    (incluye idChofer ✅)
GET  /admin/terminales
GET  /admin/suscripciones
GET  /admin/reclamos
GET  /admin/soporte
GET  /admin/api-keys
GET  /admin/liquidaciones (comisiones)
GET  /admin/pasajeros                 (⚠️ con el bug de encoding del punto 1.2)
GET  /admin/boletos
```

### Nota sobre el JWT

El payload del `accessToken` (decodificado, no verificado — el frontend nunca firma ni valida, solo lee) trae:
```json
{ "sub": "5", "email": "...", "rol": "superadmin", "id_agencia": null, "exp": ..., "type": "access" }
```
Ojo: el body de la respuesta de login usa `idAgencia` (camelCase), pero el claim dentro del JWT usa `id_agencia` (snake_case). El frontend ya maneja ambos casos — solo lo documentamos para que si cambian uno, sepan que rompe al otro lado.
