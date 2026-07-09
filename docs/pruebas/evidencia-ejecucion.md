# Evidencia de Ejecución — Suite E2E (Playwright)

**Fecha de la corrida:** 2026-07-08
**Comando:** `npx playwright test --project=setup --project=chromium`
**Entorno:**
- Frontend: `npm run dev` (Next.js 16.2.10, Turbopack) en `http://localhost:3000`
- Backend: `uvicorn app.main:app` (FastAPI, Python 3.12) en `http://localhost:5000`
- Base de datos: PostgreSQL real (Neon, ambiente de desarrollo) — datos sembrados, sin mocks
- Navegador: Chromium (Playwright 1.59.1)

## Resultado

```
✓  1 [setup]    autenticar como superadmin                                                          (14.5s)
✓  2 [setup]    autenticar como admin de agencia                                                     (8.5s)
✓  3 [chromium] agencias.spec.ts › la lista de agencias carga y muestra filas                        (3.8s)
✓  4 [chromium] agencias.spec.ts › el botón "Nueva agencia" es visible para superadmin                (3.0s)
✓  5 [chromium] agencias.spec.ts › RUC con 10 dígitos deja el botón "Crear agencia" deshabilitado     (2.8s)
✓  6 [chromium] agencias.spec.ts › crear una agencia con RUC de 11 dígitos válido                     (5.7s)
✓  7 [chromium] agencias.spec.ts › ver el detalle de una agencia desde la tabla                       (7.9s)
✓  8 [chromium] agencias.spec.ts › "Nueva agencia" no disponible para admin de agencia                (2.2s)
✓  9 [chromium] auth.spec.ts › login exitoso con credenciales válidas redirige al dashboard            (5.7s)
✓ 10 [chromium] auth.spec.ts › login con contraseña incorrecta muestra error y no navega               (3.7s)
✓ 11 [chromium] auth.spec.ts › login con email inválido no navega (validación nativa)                  (1.9s)
✓ 12 [chromium] auth.spec.ts › login con contraseña < 8 caracteres muestra error de validación         (2.0s)
✓ 13 [chromium] auth.spec.ts › ruta protegida sin sesión redirige a login                              (1.3s)
✓ 14 [chromium] auth.spec.ts › admin de agencia no ve la sección "Agencias"                            (3.6s)
✓ 15 [chromium] reclamos.spec.ts › la lista de reclamos carga                                          (4.4s)
✓ 16 [chromium] reclamos.spec.ts › ver detalle de un reclamo y cambiar su estado                       (3.8s)
✓ 17 [chromium] viajes.spec.ts › la lista de viajes carga y muestra filas                              (3.2s)
✓ 18 [chromium] viajes.spec.ts › buscar viaje sin coincidencias no rompe la tabla                      (2.7s)
✓ 19 [chromium] viajes.spec.ts › crear un nuevo viaje con datos válidos                                (7.3s)
✓ 20 [chromium] viajes.spec.ts › ver el detalle de un viaje desde la tabla                             (4.1s)

20 passed (1.6m)
```

**20/20 casos automatizados en verde**, ejecutados después de:
1. Corregir los 5 defectos funcionales DEF-01 a DEF-05 (ver `analisis-riesgos-seguridad.md`).
2. Actualizar `next` (16.2.4 → 16.2.10) y `axios` (1.15.2 → 1.18.1) para resolver 5 vulnerabilidades de severidad alta (SEC-05), verificando que la suite completa siguiera pasando tras el cambio de dependencias — es decir, esta corrida también sirve como **prueba de regresión post-actualización de dependencias**.

## Historial de la sesión de pruebas (resumen honesto, no solo el resultado final)

La primera corrida completa de la suite tuvo **4 fallos**, todos investigados hasta la causa raíz antes de decidir si el defecto estaba en el test o en la aplicación:

| # | Test | Causa raíz | Dónde se corrigió |
|---|---|---|---|
| 1 | `agencias.spec.ts` "ver detalle" | Selector de test incorrecto (`role=link` en vez de `role=button`, por HTML inválido — ver DEF-06) | Test |
| 2 | `viajes.spec.ts` "buscar sin coincidencias" | **Bug real de la app**: crash por `TypeError` (DEF-01) | Aplicación |
| 3 | `viajes.spec.ts` "crear viaje" | Suposición incorrecta del test (asumía 1 destino por origen) | Test |
| 4 | `viajes.spec.ts` "ver detalle" | Suposición incorrecta del test (asumía botón "Editar" que no existe — DEF-04) | Test |

Tras corregir esos 4 puntos, la segunda corrida completa bajó a 1 fallo (`agencias.spec.ts` "ver detalle", con un selector `role=button` que tampoco aplicaba porque esa pantalla usa el patrón `asChild` → `role=link`), corregido para la tercera corrida, que dio **20/20**.

Este historial se documenta deliberadamente (en vez de mostrar solo el resultado final en verde) porque es evidencia del proceso real de depuración exigido por el curso: distinguir un falso positivo del arnés de pruebas de un defecto real del sistema bajo prueba.
