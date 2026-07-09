# Matriz de Casos de Prueba — Bustoke Admin Frontend

Convención de ID: `TC-<MÓDULO>-<N°>`. Todos los casos marcados **Automatizado** están implementados en `e2e/*.spec.ts` y se ejecutan contra el sistema real (frontend + backend + base de datos, sin mocks). El resultado real de la última corrida está en `docs/pruebas/evidencia-ejecucion.md`.

## 1. Autenticación (`e2e/auth.spec.ts`)

| ID | Técnica | Precondición | Entrada | Resultado esperado | Automatizado |
|---|---|---|---|---|---|
| TC-AUTH-01 | Caja negra — camino feliz | Usuario `superadmin` válido existe | email/password correctos | Redirige a `/dashboard`, muestra "Panel de Administración" | ✅ |
| TC-AUTH-02 | Caja negra — clase de equivalencia inválida | — | password incorrecta | Diálogo "Error al iniciar sesión", permanece en `/iniciar-sesion` | ✅ |
| TC-AUTH-03 | Caja negra — formato inválido | — | email sin `@` (`no-es-un-correo`) | El navegador bloquea el envío (validación nativa HTML5); no navega. Ver DEF-06 (mensaje en inglés, no en español) | ✅ |
| TC-AUTH-04 | Valor límite | — | password de 7 caracteres (mínimo válido = 8) | Error Zod: "La contraseña debe tener al menos 8 caracteres." | ✅ |
| TC-AUTH-05 | Control de acceso | Sin sesión iniciada | `GET /dashboard` | Redirige a `/iniciar-sesion?callbackUrl=...` | ✅ |
| TC-AUTH-06 | RBAC | Usuario `admin_agencia` válido | login exitoso | El link "Agencias" **no** existe en el sidebar | ✅ |
| TC-AUTH-07 | Valor límite (no automatizado) | — | password de exactamente 8 caracteres | Login se procesa (pasa validación de formulario) | ⬜ Manual |
| TC-AUTH-08 | Caja negra — negativo (no automatizado) | — | email de usuario que no existe en BD | Mismo mensaje genérico de error (no debe filtrar si el email existe o no — control OWASP A07) | ⬜ Manual, ver hallazgo SEC-03 |

## 2. Gestión de Viajes (`e2e/viajes.spec.ts`)

| ID | Técnica | Precondición | Entrada | Resultado esperado | Automatizado |
|---|---|---|---|---|---|
| TC-VIA-01 | Humo / sistema | Existen viajes sembrados | Navegar a `/viajes` | Tabla carga con filas visibles | ✅ |
| TC-VIA-02 | Caja negra — equivalencia "sin resultados" | — | Texto de búsqueda sin coincidencias | Se muestra "Sin resultados" (no crash). **Detectó DEF-01 y DEF-04** | ✅ |
| TC-VIA-03 | Caja negra — flujo completo (crear) | Existen rutas/buses/choferes | Formulario completo válido | Viaje creado, diálogo se cierra | ✅ |
| TC-VIA-04 | Caja negra — navegación | Existe al menos 1 viaje | Click en "Ver detalle" | Navega a `/viajes/{id}`, muestra acciones (Boletos, etc.). **Detectó DEF-03** | ✅ |
| TC-VIA-05 | Valor límite (no automatizado) | — | `fechaHoraLlegada` anterior a `fechaHoraSalida` | El formulario debería rechazar o advertir — **no hay validación cliente actualmente** (ver DEF-07) | ⬜ Manual |
| TC-VIA-06 | Caja negra — eliminar (no automatizado) | Existe 1 viaje | Click en "Eliminar" → confirmar | Viaje eliminado de la lista | ⬜ Manual |
| TC-VIA-07 | Transición de estado (no automatizado) | Viaje en estado `programado` | Editar → cambiar a `en_curso` → `finalizado` | Transiciones válidas se guardan; no hay máquina de estados que impida saltos ilógicos (`programado`→`finalizado` directo) — riesgo de datos inconsistentes | ⬜ Manual, ver hallazgo RIESGO-02 |

## 3. Gestión de Agencias (`e2e/agencias.spec.ts`)

| ID | Técnica | Precondición | Entrada | Resultado esperado | Automatizado |
|---|---|---|---|---|---|
| TC-AGE-01 | Humo / sistema | — | Navegar a `/agencias` | Tabla carga | ✅ |
| TC-AGE-02 | RBAC | Sesión `superadmin` | — | Botón "Nueva agencia" visible | ✅ |
| TC-AGE-03 | **Valor límite** (bajo el límite) | Dialog "Nueva agencia" abierto | RUC = 10 dígitos | Mensaje "El RUC debe tener 11 dígitos", botón deshabilitado | ✅ |
| TC-AGE-04 | **Valor límite** (en el límite) | Dialog abierto | RUC = 11 dígitos, razón social válida | Botón habilitado, agencia creada y visible en tabla | ✅ |
| TC-AGE-05 | Caja negra — navegación | Existe ≥1 agencia | Click "Ver detalle" | Navega a `/agencias/{id}`, botón "Editar" visible | ✅ |
| TC-AGE-06 | RBAC (negativo) | Sesión `admin_agencia` | Navegar a `/agencias` | Botón "Nueva agencia" **no** existe (0 elementos) | ✅ |
| TC-AGE-07 | Valor límite (no automatizado) | — | RUC = 12 dígitos | Bloqueado por `maxLength=11` del input — no alcanzable por UI de escritorio; **si se envía por API directamente, el backend debe validar también** (ver SEC-02, validación duplicada cliente/servidor) | ⬜ Manual/API |
| TC-AGE-08 | Caja negra — clase inválida (no automatizado) | Dialog abierto | RUC con letras (`ABCDEFGHIJK`) | El input es `type="text"` sin `pattern`; **acepta letras en un campo numérico regulatorio** | ⬜ Manual, ver DEF-08 |

## 4. Reclamos y Soporte (`e2e/reclamos.spec.ts`)

| ID | Técnica | Precondición | Entrada | Resultado esperado | Automatizado |
|---|---|---|---|---|---|
| TC-REC-01 | Humo / sistema | Existen reclamos sembrados | Navegar a `/reclamos` | Tabla carga | ✅ |
| TC-REC-02 | Transición de estado | Existe ≥1 reclamo | Cambiar `select` de estado | Persiste el nuevo estado tras refrescar | ✅ |
| TC-SOP-01 | Caja negra (no automatizado) | Sesión `admin_agencia` | Cambiar estado de ticket de soporte | Según código, solo `superadmin` puede cambiar estado; `admin_agencia` debería ver solo lectura — **no verificado con test automatizado**, ver alcance futuro | ⬜ Manual |

## 5. Caja blanca — cobertura de condiciones (decisión múltiple)

Técnica aplicada: **cobertura de decisión/condición** sobre la lógica de habilitación del botón "Crear agencia" en `agencia-table-level.tsx`:

```ts
disabled={submitting || !ruc.trim() || !razonSocial.trim() || ruc.trim().length !== 11}
```

4 condiciones atómicas → tabla de combinaciones relevantes (no exhaustiva 2⁴=16, se seleccionan las de mayor valor de detección de defectos):

| Caso | `submitting` | `ruc` vacío | `razonSocial` vacío | `len(ruc) ≠ 11` | `disabled` esperado | Cubierto por |
|---|---|---|---|---|---|---|
| CB-01 | F | F | F | F (len=11) | **false** (habilitado) | TC-AGE-04 ✅ |
| CB-02 | F | F | F | T (len=10) | **true** | TC-AGE-03 ✅ |
| CB-03 | F | T | F | T (len=0) | **true** | Implícito (estado inicial del dialog) |
| CB-04 | F | F | T | F | **true** | ⬜ No cubierto — razón social vacía con RUC válido |
| CB-05 | T | F | F | F | **true** (mientras se envía) | ⬜ No cubierto — condición de carrera al hacer doble click |

**Hallazgo de la cobertura de caja blanca:** CB-05 no está protegido más que por el `disabled` de React — si el evento de click se dispara antes de que React vuelva a renderizar (doble click muy rápido / doble tap en móvil), es posible enviar dos requests de creación concurrentes. No se pudo confirmar/descartar en el tiempo disponible; queda como riesgo abierto (RIESGO-01) en `analisis-riesgos-seguridad.md`.

## 6. Resumen de técnicas aplicadas

| Técnica | Casos que la usan |
|---|---|
| Partición de equivalencia | TC-AUTH-02/03, TC-VIA-02, TC-AGE-08 |
| Valor límite | TC-AUTH-04/07, TC-AGE-03/04/07 |
| Pruebas basadas en riesgo | Todo §5 del plan de pruebas; priorización P0/P1/P2 |
| Control de acceso basado en rol (RBAC) | TC-AUTH-06, TC-AGE-02/06, TC-SOP-01 |
| Caja blanca (cobertura de condición) | CB-01 a CB-05 |
| Transición de estados | TC-REC-02, TC-VIA-07 |
| Exploratoria (llevó a defectos no buscados deliberadamente) | DEF-01 a DEF-05 |
