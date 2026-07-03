# Transición a Backend Real — Mapa de Migración

## 1. Páginas casi listas para backend

Ya consumen API via `api.{entity}.list()` (drilldown) o tienen mock server endpoint.

| Página | Patrón actual | Solo requiere |
|---|---|---|
| `/agencias` | `useAgencias()` → `GET /api/admin/agencias` | Backend real implementando mismo contrato |
| `/flota` | `useFlota()` → `GET /api/admin/flota` | ídem |
| `/rutas` | `useRutas()` → `GET /api/admin/rutas` | ídem |
| `/viajes` | `useViajes()` → `GET /api/admin/viajes` | ídem |
| `/reportes-y-analitica/[slug]` | `GET /reports/:slug` via API | ídem |
| `/agencias/[id]/rutas` | Mixto: `useRutas` + `getTerminalById` | Solo lookup de nombres de terminal |
| `/agencias/[id]/flota` | Mixto: `useFlota` + `getAgenciaById` | Solo lookup de nombre de agencia |

**Auth:** 7 endpoints (`login`, `refresh`, `logout`, `recover-email`, `reset-password`, etc.) ya en mock server y en frontend.

---

## 2. Páginas que dependen de data.ts directo

| Página | Importa de data.ts | Dependencia |
|---|---|---|
| `/terminales` | `MOCK_TERMINALES` | Tabla recibe data como prop |
| `/suscripciones` | `MOCK_SUSCRIPCIONES` | ídem |
| `/soporte` | `MOCK_TICKETS_SOPORTE` | ídem |
| `/reclamos` | `MOCK_RECLAMOS` | ídem |
| `/pasajeros` | `MOCK_PASAJEROS` via `MockRepository` | Usa `useRepository()` con clase concreta |
| `/boletos` | `MOCK_BOLETOS` via `MockRepository` | ídem |
| `/comisiones` | `MOCK_LIQUIDACIONES` + `getAgenciaById` | Datos inline y lookup por ID |
| `/configuracion` | `MOCK_API_KEYS` + `getAgenciaById` | ídem |
| `/configuracion/api-keys` | `MOCK_API_KEYS` + `getAgenciaById` | ídem |
| `/agencias/[id]` | `getAgenciaById`, `getBusesByAgenciaId`, etc. | 5 lookups distintos |
| `/flota/[id]` | `getBusById`, `getAgenciaById`, `MOCK_VIAJES` | 3 lookups |
| `/viajes/[id]` | `getViajeById`, `getRutaById`, `getBusById`, etc. | 5 lookups |
| `/viajes/[id]/boletos` | `getBoletosByViajeId`, `getPasajeroById` | Ya existe endpoint mock, pero UI no lo usa |
| `/viajes/[id]/pasajeros` | `getBoletosByViajeId`, `getRutaById` | ídem |
| `/viajes/[id]/asientos` | `getAsientosByBusId`, `getBoletosByViajeId` | Ya existe endpoint mock (`/admin/asientos?busId=`) |
| `/viajes/[id]/manifiesto` | `getManifiestoByViajeId` | Sin endpoint mock |
| `/viajes/[id]/check-in` | (por verificar) | Sin endpoint mock |

---

## 3. Endpoints backend que faltan

Para eliminar todos los imports directos de `data.ts`, el backend real debe implementar:

### Listados (nuevos)
```
GET /admin/terminales        # reemplaza MOCK_TERMINALES
GET /admin/suscripciones     # reemplaza MOCK_SUSCRIPCIONES
GET /admin/soporte           # reemplaza MOCK_TICKETS_SOPORTE
GET /admin/reclamos          # reemplaza MOCK_RECLAMOS
```

### Detalle (`:id`)
```
GET /admin/flota/:id            # reemplaza getBusById
GET /admin/rutas/:id            # reemplaza getRutaById
GET /admin/viajes/:id           # reemplaza getViajeById
GET /admin/viajes/:id/manifiesto
GET /admin/viajes/:id/check-in
```

### Anidados / cross-ref
```
GET /admin/agencias/:id/flota       # reemplaza getBusesByAgenciaId
GET /admin/agencias/:id/rutas       # reemplaza getRutasByAgenciaId
GET /admin/agencias/:id/viajes      # reemplaza getViajesByAgenciaId
GET /admin/agencias/:id/terminales  # reemplaza getTerminalesByAgenciaId (vía pivot)
GET /admin/buses/:id/viajes         # reemplaza filtro manual MOCK_VIAJES.filter(idBus)
GET /admin/viajes/:id/asientos      # ya existe como /admin/asientos?busId=
```

### Lookups para nombres (composicion)
```
GET /admin/pasajeros/:id          # reemplaza getPasajeroById
GET /admin/terminales/:id         # reemplaza getTerminalById
GET /admin/planes/:id             # reemplaza getPlanById
```

### Total: ~20 endpoints faltantes (12 críticos, 8 opcionales)

---

## 4. Orden recomendado de migración

### Fase 1 — Reemplazar MockRepository (día 1)
```
1. Implementar ApiRepository<T> que implemente Repository<T> usando fetch
   → toda página que usa useRepository() se migra cambiando 1 línea
2. Afecta: /pasajeros, /boletos
```

### Fase 2 — Listados directos (día 2-3)
```
3. Agregar endpoint GET /admin/terminales → migrar /terminales
4. Agregar endpoint GET /admin/suscripciones → migrar /suscripciones
5. Agregar endpoint GET /admin/soporte → migrar /soporte
6. Agregar endpoint GET /admin/reclamos → migrar /reclamos
```

### Fase 3 — Páginas inline (día 3-4)
```
7. Agregar endpoint GET /admin/liquidaciones → migrar /comisiones
8. Agregar endpoint GET /admin/api-keys → migrar /configuracion/api-keys
```

### Fase 4 — Detalles y cross-ref (día 4-5)
```
9. Agregar endpoints /admin/flota/:id, /admin/rutas/:id, /admin/viajes/:id
   → migrar páginas de detalle a useEntityById()
10. Agregar endpoints anidados de agencia (flota, rutas, viajes, terminales)
```

### Fase 5 — Sub-páginas de viaje (día 5-6)
```
11. Migrar /viajes/[id]/boletos a useEntityById(viajeRepository) + endpoint boletos
12. Migrar /viajes/[id]/pasajeros a endpoint /admin/viajes/:id/pasajeros
13. Migrar /viajes/[id]/asientos a endpoint /admin/asientos?busId=
14. Agregar /admin/viajes/:id/manifiesto y /admin/viajes/:id/check-in si existen
```

---

> **Backend objetivo:** Python FastAPI. Los riesgos abajo consideran particularidades de ese stack.

## 5. Riesgos de integración

### 5.1 FastAPI — camelCase vs snake_case

**Problema:** Pydantic por defecto serializa con snake_case (`razon_social`, `fecha_hora_salida`). El frontend espera camelCase (`razonSocial`, `fechaHoraSalida`).

**Soluciones (elegir una):**

- **A) FastAPI con `by_alias=True`** en cada endpoint — trabajoso, propenso a errores
- **B) Pydantic v2 config global** con `alias_generator` y `populate_by_name`, recomendada:
  ```python
  from pydantic import BaseModel
  from humps import camelize  # pip install pyhumps
  
  class BaseSchema(BaseModel):
      model_config = {
          "alias_generator": lambda s: camelize(s),  # snake_case → camelCase
          "populate_by_name": True,                   # aceptar ambos formatos al leer
      }
  ```
  Todos los schemas heredan de `BaseSchema`. El frontend recibe camelCase, el backend recibe camelCase y lo mapea a snake_case internamente.

### 5.2 FastAPI — formato de error

| Backend envía | Frontend espera |
|---|---|
| `{"detail": "mensaje"}` (default FastAPI) | `{"message": "mensaje"}` (mock server) |

**Solución:** En FastAPI, registrar un `exception_handler` global que unifique el formato:
```python
@app.exception_handler(HTTPException)
async def custom_handler(request, exc):
    return JSONResponse(status_code=exc.status_code, content={"message": exc.detail})
```
O usar `message` directamente en los endpoints.

### 5.3 FastAPI — paginación

| Backend suele enviar | Frontend espera |
|---|---|
| `{"items": [...], "total": N, "page": 1, "size": 20}` | Array plano `[...]` o `{"data": [...], "meta": {"page": 1, "totalItems": N}}` |

**Solución:** El frontend ya tiene una normalización en el quick win `ApiRepository.list()`:
```typescript
const data = await res.json();
return Array.isArray(data) ? data : data.data;
```
Si FastAPI devuelve `{"items": [...]}`, ajustar a `data.items ?? data.data ?? data`.

### 5.4 FastAPI — CORS

FastAPI corre típicamente en puerto distinto (8000, 8080). El frontend Next.js hace rewrites, pero si se llama directo:

```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)
```

### 5.5 FastAPI — Auth (JWT)

El frontend envía `Authorization: Bearer <token>` y espera login response con esta forma:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "accessTokenExpiresAt": "2026-...",
  "refreshTokenExpiresAt": "2026-...",
  "sessionId": "...",
  "user": { "id": "1", "email": "...", "name": "...", "role": "admin_agencia" }
}
```
FastAPI con `python-jose` + `passlib` es la combinación típica. El campo `name` no existe en `Usuario` canónico (tiene `nombres` + `apellidos`). En el frontend, `auth-store` necesita `name` para el header. Solución: concatenar en el backend al generar el token.

### 5.6 FastAPI — Ubigeo

El mock expone `{value, label}` por razones históricas de componentes select. El frontend no tiene páginas de mantenimiento de ubigeo hoy. Cuando se necesiten, el backend puede exponer la forma canónica `{id, nombre}` y el frontend normaliza en el adapter del select.

### 5.7 Next.js API routes y Node.js en `src/` — no interfieren con FastAPI

Hay código Node.js en `src/` pero está **aislado en server-side de Next.js** y no afecta la integración con Python:

| Archivo | Node.js dependency | Motivo | ¿Afecta a FastAPI? |
|---|---|---|---|
| `src/app/api/reports/[slug]/export/route.ts` | `Buffer`, `runtime = 'nodejs'`, `serverHttpClient` | Next.js API route que proxy al backend | **No** — es un proxy; cuando FastAPI sirva reports, esta ruta se elimina o redirige |
| `src/app/api/auth/[...nextauth]/route.ts` | `NextAuth`, `authOptions` | NextAuth handler — manejador de sesión server-side | **Parcialmente** — si FastAPI maneja auth, NextAuth puede eliminarse; el frontend ya usa JWT directo |
| `src/features/auth/infraestructure/auth.options.ts` | `NextAuthOptions` | Config de NextAuth (providers, callbacks, JWT) | Depende — si se migra auth a FastAPI, este archivo se elimina |
| `src/lib/http/server-http-client.ts` | `axios`, `getServerAuthSession` | Cliente HTTP para server actions y API routes | **No** — las server actions son opcionales; el frontend cliente usa `fetch` directo |
| `src/lib/actions/bulk-upload.actions.ts` | `Buffer`, `serverHttpClient` | Server action para carga masiva | **No** — reemplazable por llamada directa a FastAPI |
| `src/lib/constants/environments.ts` | `process.env` | Acceso a vars de entorno (Next.js lo resuelve en build-time) | **No** — funciona igual |

**Conclusión:** El código Node.js en `src/` está todo dentro del framework Next.js (API routes, server actions, NextAuth). No hay dependencias de Node.js en código cliente (componentes React, hooks, páginas). Cuando FastAPI esté listo:
- Las API routes **se eliminan o simplifican** a proxies finos
- NextAuth **se reemplaza** por JWT manejado directamente (el frontend cliente ya usa fetch con `accessToken`)
- `serverHttpClient` **se deja de usar** progresivamente

### 5.8 Riesgos generales (independientes del stack)

| Riesgo | Impacto | Mitigación |
|---|---|---|
| **Paginación en listados** — drilldown hoy espera array completo, backend paginará | Tablas con muchos registros | `ApiRepository.list()` normaliza; si el backend ya paginó, habrá que migrar el frontend a paginación controlada |
| **Errores de red** — mock nunca falla, backend real sí | UX sin manejo de error | Ya hay bloque `catch` en `useEntity` y `useRepository`, probar |
| **Tiempo de respuesta** — mock es instantáneo, backend real tiene latencia | Spinners nunca probados | Verificar que `isLoading` se muestra correctamente en todas las páginas |

---

## 6. Quick wins (conectar backend sin romper frontend)

Estos cambios se pueden hacer **antes** de tener el backend real, sin riesgo:

1. **Crear `ApiRepository<T>`** ( ~40 líneas)
   ```typescript
   // infrastructure/repositories/api-repository.ts
   import type { Repository } from './repository.interface';
   
   export class ApiRepository<T extends { id: string }> implements Repository<T> {
     constructor(private basePath: string) {}
   
     async list(): Promise<T[]> {
       const res = await fetch(`/api/admin/${this.basePath}`);
       if (!res.ok) throw new Error(`API error: ${res.status}`);
       const data = await res.json();
       return Array.isArray(data) ? data : data.data;
     }
   
     async getById(id: string): Promise<T | null> {
       const res = await fetch(`/api/admin/${this.basePath}/${id}`);
       if (res.status === 404) return null;
       if (!res.ok) throw new Error(`API error: ${res.status}`);
       return res.json();
     }
     // ... create, update, delete
   }
   ```
   Luego en cualquier página: cambiar `new MockRepository(MOCK_X)` por `new ApiRepository<X>('entidad')`.

2. **Unificar `useEntity` y `useRepository`** — son casi idénticos (`features/drilldown/` vs `infrastructure/hooks/`). Elegir uno y eliminar el otro.

3. **Migrar lookup helpers a API** — `getTerminalById()` se vuelve `useEntityById(terminalRepository, id)`. Se puede hacer página por página sin tocar el resto.

4. **Agregar `getById` al drilldown `api.ts`** — ya existe `api.agencias.byId`, agregar para `flota`, `rutas`, `viajes`.

5. **Probar con el mock server actual** — todos los endpoints nuevos ya existen en `mock-server.ts`. Se puede migrar una página a API, apuntar al mock server, y verificar que funciona antes de tener backend real.
