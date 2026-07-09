# Análisis de Riesgos, Defectos y Seguridad — Bustoke Admin Frontend

Este documento consolida (a) los defectos funcionales encontrados y corregidos durante la automatización de pruebas, (b) los riesgos abiertos identificados pero no resueltos por estar fuera del alcance de tiempo del proyecto, y (c) una revisión de seguridad dirigida, mapeada a OWASP Top 10 (2021) y prácticas DevSecOps.

Metodología: no fue una auditoría de caja negra genérica — cada hallazgo de seguridad se obtuvo leyendo el código real de autenticación (`middleware.ts`, `auth.options.ts`), corriendo `npm audit` contra las dependencias realmente instaladas, y observando el comportamiento real de la app bajo Playwright.

---

## 1. Defectos funcionales encontrados y corregidos

Todos estos defectos fueron encontrados por los casos de prueba automatizados de `e2e/`, **no** por inspección manual del código — es evidencia de que la automatización pagó su costo de desarrollo dentro de este mismo proyecto.

### DEF-01 — Crítico — Crash de página en buscador de Viajes
- **Dónde:** `src/features/viajes/components/viajes-table.tsx`
- **Causa raíz:** el backend serializa `idRuta`/`idBus` como `number` en JSON; el tipo TypeScript `Viaje.idRuta: string` es solo una promesa de compilación, no una garantía de runtime. El filtro de búsqueda llamaba `v.idRuta.toLowerCase()` directamente.
- **Cómo se manifestaba:** cualquier admin que escribiera casi cualquier texto en el buscador de `/viajes` recibía `TypeError: v.idRuta.toLowerCase is not a function` y la página completa caía a la pantalla de error de Next.js ("This page couldn't load").
- **Severidad:** Alta — bloquea una pantalla operativa de uso diario, para cualquier usuario, con una sola pulsación de teclado.
- **Detectado por:** TC-VIA-02.
- **Corrección:** `String(v.idRuta).toLowerCase()`.

### DEF-02 — Silencioso — Filtros de drilldown siempre vacíos
- **Dónde:** `src/features/drilldown/components/ruta-table-level.tsx` (línea 28) y `viaje-table-level.tsx` (línea 44)
- **Causa raíz:** comparación estricta `r.idAgencia === agencyId` entre un `number` (dato real del backend) y un `string` (parámetro de ruta de Next.js). En JavaScript, `5 === "5"` es `false`.
- **Impacto:** las vistas "Rutas de una agencia" y "Viajes de una ruta" (dentro del drilldown de Agencias) **siempre mostraban cero filas**, aun existiendo datos — sin ningún error visible, por lo que es el tipo de defecto más peligroso: falla silenciosamente y puede pasar desapercibido en producción durante meses. Ya existía el patrón correcto (`String(b.idAgencia) === agencyId`) en el archivo hermano `flota-table-level.tsx`, lo que sugiere que un desarrollador ya había aprendido esta lección pero no se propagó al resto del código.
- **Severidad:** Alta (funcionalidad completamente rota, sin mensaje de error).
- **Corrección:** normalizar con `String(...)` en ambos lados de la comparación, replicando el patrón ya correcto de `flota-table-level.tsx`.

### DEF-03 — Mismo patrón replicado en Soporte y Suscripciones
- **Dónde:** `soporte-table.tsx` (`t.idAgencia.includes(l)`) y `suscripciones-table.tsx` (`x.idPlan.includes(l)`, `x.idAgencia.includes(l)`)
- Mismo mecanismo que DEF-01: `.includes()` sobre un campo numérico. Corregido con `String(...)`.
- **Lección de proceso:** una vez identificado el patrón en un módulo, se buscó sistemáticamente (`grep`) en todo el código fuente y se encontraron 4 ocurrencias adicionales del mismo defecto en 3 módulos distintos — todas corregidas en la misma sesión. Esto ilustra el valor de generalizar un hallazgo puntual a una búsqueda de todo el código base.

### DEF-04 — Menor — Ruta de edición de Viaje inalcanzable
- **Dónde:** `src/app/(dashboard)/viajes/[id]/editar/page.tsx` existe (164 líneas de código funcional) pero ninguna pantalla enlaza a `/viajes/{id}/editar`. La única forma de editar un viaje es el diálogo de la tabla de listado.
- **Impacto:** código muerto desde la perspectiva del usuario; no es un bug funcional (el diálogo cubre el caso de uso) pero es deuda técnica y una posible fuente de confusión para el equipo de desarrollo.
- **Severidad:** Baja.
- **Estado:** documentado, no corregido (decisión de producto pendiente: ¿eliminar la ruta huérfana o enlazarla desde el detalle?).

### DEF-05 — UX/Accesibilidad — Estado vacío inconsistente
- **Dónde:** `viajes-table.tsx` no pasaba `emptyElement` a `<DataTable>`, a diferencia de `agencia-table-level.tsx` y `reclamos-table.tsx`, que sí muestran "Sin resultados".
- **Impacto:** al filtrar sin coincidencias, el usuario veía una tabla en blanco sin ninguna indicación, en vez de un mensaje claro. Inconsistente con el resto de la aplicación.
- **Severidad:** Baja (UX).
- **Corrección:** se agregó `<DataTableEmpty title="Sin resultados" description="No se encontraron viajes." />`, igualando el patrón ya usado en Agencias/Reclamos.

### DEF-06 — Accesibilidad — Nombre accesible ausente en acciones de tabla
- **Dónde:** patrón repetido `<Link href="..."><Button title="Ver detalle"><Eye /></Button></Link>` en varias tablas (Viajes, Agencias).
- **Causa raíz:** un `<button>` anidado dentro de un `<a>` es HTML inválido (los elementos interactivos no pueden anidarse); como consecuencia, el algoritmo de cómputo de nombre accesible no propaga el `title` del botón hacia el enlace. Un lector de pantalla anuncia el enlace como "link" sin nombre.
- **Contraste positivo:** el botón "Editar" del detalle de Agencia usa el patrón correcto `<Button asChild><Link>Editar</Link></Button>`, que renderiza un único `<a>` semánticamente válido y con nombre accesible correcto. Recomendación: estandarizar todos los íconos de acción de tabla al patrón `asChild`.
- **Severidad:** Media (accesibilidad — afecta a usuarios de lector de pantalla; no bloquea el uso con mouse/teclado estándar, que es por lo que pasó desapercibido).

### DEF-07 — Entorno — Next.js bloquea hidratación al acceder por `127.0.0.1`
- Al ejecutar Playwright contra `http://127.0.0.1:3000`, Next.js bloqueó la conexión HMR/webpack por política de `allowedDevOrigins`, lo que impidió que React hidratara la página. El formulario de login, sin JS activo, hizo un **submit HTML nativo por GET**, exponiendo el email y la contraseña en la URL (`/iniciar-sesion?email=...&password=...`), visible en el historial del navegador y en los logs de acceso del servidor de desarrollo.
- **Relevancia real más allá de dev:** aunque este bloqueo específico es solo de modo desarrollo, expone un riesgo de diseño más general: **el formulario de login no tiene una defensa de segundo nivel si JavaScript falla o se bloquea** (CSP restrictiva, extensión del navegador, error de hidratación en producción). Un `<form method="post">` explícito (en vez de depender 100% de que el `onSubmit` de React intercepte) evitaría que un fallo de hidratación filtre credenciales por querystring/GET en cualquier entorno.
- **Severidad:** Media (higiene de defensa en profundidad).

---

## 2. Riesgos abiertos (no resueltos, documentados)

| ID | Riesgo | Evidencia | Severidad | Estado |
|---|---|---|---|---|
| RIESGO-01 | Posible doble envío en creación de Agencia si se hace doble-click antes del primer re-render de React (condición de carrera en `disabled`) | Análisis de caja blanca, §5 de `matriz-casos-prueba.md` | Baja-Media | Abierto — requiere debounce o `useTransition` |
| RIESGO-02 | No hay máquina de estados para `estado` de Viaje: la UI permite pasar de `programado` a `cancelado` a `en_curso` en cualquier orden vía el `<select>` del diálogo | Lectura de `viaje-dialog.tsx` | Media | Abierto — decisión de negocio pendiente sobre transiciones válidas |
| RIESGO-03 | RUC de agencia acepta letras (`input type="text"` sin `pattern`/`inputMode="numeric"`) | Lectura de `agencia-table-level.tsx` | Baja | Abierto |
| RIESGO-04 | No hay suite de pruebas unitarias; toda la cobertura depende de E2E contra sistema real, más lenta y más frágil ante datos de prueba cambiantes | `plan-de-pruebas.md` §8 | Media (proceso) | Aceptado para este entregable |

---

## 3. Revisión de seguridad (OWASP Top 10:2021 + DevSecOps)

### SEC-01 — A02:2021 (Fallas Criptográficas) / Exposición innecesaria del token de acceso
**Hallazgo de mayor valor técnico de esta revisión**, obtenido leyendo `src/middleware.ts` junto con los componentes cliente que consumen `useSession()`.

`middleware.ts` ya implementa correctamente un patrón **BFF (Backend-For-Frontend) seguro** para todo `/api/admin/*`: intercepta la petición, valida la sesión desde la cookie `httpOnly` firmada, y **reconstruye la petición hacia el backend real inyectando el header `Authorization` del lado del servidor** — nunca lee ni reenvía un header `Authorization` que venga del navegador.

Sin embargo, varios componentes cliente (`admin-dashboard.tsx`, `use-entity-data.ts` + `drilldown/infrastructure/api.ts`) **igualmente** extraen `session.user.accessToken` vía `useSession()` en el navegador y arman manualmente un header `Authorization: Bearer ${token}` al llamar a `/api/admin/...`. Como el middleware ignora ese header entrante y siempre inyecta el suyo, **ese header enviado por el cliente no cumple ninguna función — es código muerto desde el punto de vista funcional**, pero tiene un costo de seguridad real: obliga a exponer el JWT de acceso del backend en la memoria de JavaScript del navegador (accesible a través de `getSession()`/`useSession()`), ampliando innecesariamente la superficie de robo de token ante un eventual XSS.

- **Recomendación:** para las llamadas a `/api/admin/*` (que ya pasan por el proxy protegido), eliminar el armado manual del header `Authorization` en el cliente y dejar que el middleware haga su trabajo; el componente no necesita `session.user.accessToken` en absoluto para esos casos. Esto reduce la superficie de exposición del token sin perder funcionalidad.
- **Nota positiva:** el flujo de exportación de reportes (`report-export-button.tsx`, corregido en este mismo proyecto en una iteración anterior) ya sigue el patrón correcto — es la plantilla a replicar en el resto de la app.

### SEC-02 — A04:2021 (Diseño Inseguro) / Validación solo en cliente
El campo RUC en el diálogo de "Nueva agencia" valida la longitud (11 dígitos) únicamente con JavaScript en el cliente (`ruc.trim().length !== 11` deshabilita el botón). No se verificó si el backend re-valida este dato de forma independiente. Cualquier validación que solo exista en el cliente puede evadirse llamando directamente a la API (`POST /admin/agencias/`) con `curl` o Postman.
- **Recomendación:** confirmar con el equipo de backend que `POST /admin/agencias/` rechaza RUC con longitud/formato inválido de forma independiente del frontend (responsabilidad compartida entre ambos componentes del proyecto integrador).

### SEC-03 — A07:2021 (Fallas de Identificación y Autenticación) / Enumeración de usuarios (no confirmado)
No se verificó si `POST /admin/auth/login` devuelve una respuesta distinguible (código de estado, tiempo de respuesta, mensaje) entre "usuario no existe" y "contraseña incorrecta". Si el backend distingue estos casos, un atacante puede enumerar cuentas válidas por fuerza bruta. Frontend siempre muestra el mismo mensaje genérico ("Error al iniciar sesión") independientemente de la causa, lo cual es correcto de este lado — el riesgo, si existe, está en el backend.
- **Estado:** marcado como pendiente de coordinación con el equipo de backend (TC-AUTH-08 en la matriz de casos).

### SEC-04 — A05:2021 (Configuración Incorrecta de Seguridad) / Sin cabeceras de seguridad HTTP
`next.config.ts` no define `headers()` con `Content-Security-Policy`, `X-Frame-Options`/`frame-ancestors`, `Strict-Transport-Security` ni `X-Content-Type-Options`. Next.js no añade estas cabeceras por defecto.
- **Impacto:** sin `X-Frame-Options`/CSP `frame-ancestors`, el panel admin es potencialmente embebible en un `<iframe>` de un sitio malicioso (clickjacking) contra un admin autenticado.
- **Recomendación:** agregar un bloque `headers()` mínimo (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, y una CSP inicial en modo *report-only* para no romper `dangerouslySetInnerHTML` de `chart.tsx`).

### SEC-05 — A06:2021 (Componentes Vulnerables y Desactualizados)
`npm audit` sobre las dependencias reales del proyecto (no genérico) encontró **8 vulnerabilidades (5 altas, 3 moderadas)** antes de esta revisión, incluyendo:

| Paquete | Severidad | Detalle | Relevancia para este sistema |
|---|---|---|---|
| `next@16.2.4` | **Alta** | Bypass de Middleware/Proxy vía inyección de parámetros de ruta dinámicos (GHSA-492v-c6pp-mqqv) y variantes de bypass adicionales | **Crítico para este proyecto**: `src/middleware.ts` es el único mecanismo que protege `/dashboard`, `/agencias`, `/viajes`, etc. de acceso no autenticado. Una vulnerabilidad de bypass de middleware ataca directamente el control de acceso de toda la aplicación. |
| `axios@1.15.2` | Alta | ReDoS, fuga de credenciales `Proxy-Authorization` en redirecciones, contaminación de prototipos | Usado en `serverHttpClient` para todas las llamadas server-side al backend |
| `ws` (transitivo) | Alta | DoS por agotamiento de memoria con fragmentos pequeños | Dependencia transitiva de tooling |
| `form-data` (transitivo) | Alta | Inyección CRLF en nombres de campo/archivo | Dependencia transitiva |
| `postcss`, `uuid` (transitivos de `next`/`next-auth`) | Moderada | XSS en salida CSS / bounds check en buffers | Requieren downgrade mayor (`next-auth@3`) para resolver — **no aplicado**, riesgo aceptado |

**Acción tomada durante este proyecto:** se ejecutó `npm audit fix` (sin `--force`), lo que actualizó `next` → `16.2.10` y `axios` → `1.18.1` sin cambios incompatibles, resolviendo las 5 vulnerabilidades altas, incluida la de bypass de middleware. Se verificó que `tsc`, `eslint`, `next build` y la suite completa de Playwright (20/20) siguen en verde tras la actualización. Las 4 vulnerabilidades moderadas restantes requieren un downgrade mayor de `next-auth` (v4→v3) y se dejan como riesgo aceptado, documentado aquí para que el equipo decida conscientemente.

- **Recomendación DevSecOps:** integrar `npm audit --audit-level=high` como paso obligatorio del pipeline de CI (ver `.github/workflows/ci.yml`), para que una vulnerabilidad de esta severidad no vuelva a pasar desapercibida en un merge futuro.

### SEC-06 — Controles positivos ya presentes (para no sesgar el informe solo a lo negativo)
- `.env*` está correctamente excluido de git (`.gitignore`), evitando fuga de secretos (`NEXTAUTH_SECRET`, credenciales de BD) al repositorio.
- El diálogo de confirmación global (`global-alert-dialog.tsx`) sanea explícitamente cualquier texto antes de mostrarlo (`renderSafeDialogText` strip de tags HTML), evitando XSS aunque en el uso actual el contenido siempre es estático.
- La sesión usa estrategia JWT de NextAuth con `refreshToken` y expiración corta del `accessToken`, con renovación automática (`refreshAccessToken`) — buen manejo de ciclo de vida de sesión.
- El middleware ya centraliza el control de acceso a nivel de ruta en un solo archivo (`middleware.ts`), en vez de dispersar checks de autorización por cada página — buena práctica de mantenibilidad y auditabilidad.

---

## 4. Resumen ejecutivo (para la exposición del equipo)

| Categoría | Cantidad | Severidad más alta |
|---|---|---|
| Defectos funcionales corregidos | 5 (DEF-01 a DEF-05) | Alta (crash de página en producción) |
| Defectos de accesibilidad/entorno documentados | 2 (DEF-06, DEF-07) | Media |
| Riesgos abiertos (requieren decisión de producto) | 4 (RIESGO-01 a 04) | Media |
| Hallazgos de seguridad (OWASP) | 6 (SEC-01 a 06) | Alta (dependencia vulnerable en el mecanismo de control de acceso) |
| Vulnerabilidades de dependencias corregidas en este proyecto | 5 altas / 8 totales | Alta → corregidas sin romper la suite |
