# Plan de Pruebas — Bustoke Admin Frontend

**Curso:** Pruebas de Software — VII Ciclo — 2026-I
**Componente evaluado:** `bustoke-v2-admin-frontend` (panel administrativo web)
**Sistema completo:** Bustoke — plataforma SaaS de gestión para empresas de transporte interprovincial de pasajeros (multi-agencia)
**Alcance de este documento:** exclusivamente el frontend de administración (Next.js/React). El backend (FastAPI) y el frontend de usuario final se prueban en componentes hermanos del mismo proyecto integrador.

---

## 1. Introducción y alcance del sistema

Bustoke Admin es el panel que usan dos tipos de usuarios:

- **Superadmin** (staff de Bustoke): administra todas las agencias de transporte de la plataforma, crea agencias, ve reportes globales y gestiona suscripciones/comisiones.
- **Admin de agencia** (cliente B2B, p. ej. Cruz del Sur, Oltursa, Civa, Móvil Bus): gestiona únicamente los datos de su propia agencia (flota, rutas, viajes, boletos, reclamos, soporte).

Módulos principales: Dashboard, Agencias, Terminales, Flota, Rutas, Viajes (con sub-flujos: check-in, manifiesto SUTRAN, boletos, pasajeros, asientos), Reclamos, Soporte, Comisiones, Suscripciones, API Keys, Reportes y Analítica, Configuración.

**Riesgo de negocio dominante:** este es un panel B2B multi-tenant que maneja datos financieros (comisiones, tarifas) y regulatorios (manifiesto SUTRAN es exigido por la autoridad peruana de transporte). Dos clases de error son inaceptables:
1. Que un `admin_agencia` vea o modifique datos de **otra** agencia (fuga de datos entre tenants).
2. Que un error de UI bloquee una operación diaria crítica (crear un viaje, registrar un boletaje, generar el manifiesto).

Esta priorización de riesgo guía toda la estrategia de pruebas (ver §5, pruebas basadas en riesgo).

---

## 2. Objetivos de las pruebas

1. Verificar que los flujos CRUD críticos (Viajes, Agencias, Reclamos/Soporte) funcionan correctamente de punta a punta contra el backend real.
2. Verificar el control de acceso basado en rol (RBAC) en la UI: qué ve y qué puede hacer un `superadmin` vs. un `admin_agencia`.
3. Detectar defectos de integración entre el contrato de datos del backend (tipos reales en JSON) y las suposiciones de tipos del frontend (TypeScript es solo compile-time; no protege en runtime).
4. Evaluar accesibilidad básica (nombres accesibles en elementos interactivos) y consistencia de UX (estados vacíos, mensajes de validación).
5. Identificar riesgos de seguridad de tipo cliente (OWASP) relevantes a una SPA/SSR de Next.js con autenticación JWT.

---

## 3. Niveles de prueba (ISTQB)

| Nivel | Aplicación en este componente | Herramienta |
|---|---|---|
| **Pruebas unitarias** | Fuera del alcance de este entregable: el frontend actual no tiene suite unitaria (no hay Jest/Vitest configurado). Se documenta como brecha en §8. | — |
| **Pruebas de integración** | Verificadas indirectamente por las pruebas E2E, que ejercitan la integración real Next.js (route handlers `/api/...`) → FastAPI → PostgreSQL (Neon). No se mockea el backend. | Playwright (contra backend real) |
| **Pruebas de sistema** | Núcleo de este entregable: flujos completos de usuario (login → navegar → CRUD → logout) contra la aplicación desplegada localmente (frontend + backend + BD real). | Playwright |
| **Pruebas de aceptación** | Escenarios de negocio explícitos: "un admin de agencia no debe poder crear agencias", "el RUC debe tener exactamente 11 dígitos", "un usuario sin sesión no accede al dashboard". | Playwright (casos TC-AGE-06, TC-AGE-03/04, TC-AUTH-05) |

## 4. Tipos de prueba (ISO/IEC 29119)

| Tipo | Justificación de negocio | Evidencia |
|---|---|---|
| **Funcional (caja negra)** | CRUD de Viajes/Agencias y flujo de Reclamos son la operación diaria del cliente B2B; un defecto aquí bloquea la venta/operación. | `e2e/viajes.spec.ts`, `e2e/agencias.spec.ts`, `e2e/reclamos.spec.ts` |
| **Control de acceso / RBAC** | El modelo de negocio es multi-tenant; una fuga de datos entre agencias competidoras (Cruz del Sur, Civa, etc.) sería un incidente grave de confianza. | `e2e/auth.spec.ts` (TC-AUTH-06), `e2e/agencias.spec.ts` (TC-AGE-02/06) |
| **Validación de datos (equivalencia y valor límite)** | El RUC peruano tiene una longitud fija (11 dígitos) regulada por SUNAT; aceptar un RUC inválido genera datos corruptos que luego afectan reportes/manifiesto SUTRAN. | `e2e/agencias.spec.ts` (TC-AGE-03/04) |
| **Negativo / manejo de errores** | Login fallido, sesión expirada, formularios inválidos: deben fallar de forma controlada, no romper la página. | `e2e/auth.spec.ts` |
| **Regresión de defectos** | Cuatro defectos de severidad alta se encontraron y corrigieron durante este proyecto (ver `analisis-riesgos-seguridad.md`); los mismos casos de prueba que los detectaron quedan en la suite como prueba de regresión permanente. | Suite completa |
| **Seguridad (análisis estático + revisión dirigida)** | Ver `analisis-riesgos-seguridad.md` — mapeo a OWASP Top 10 / OWASP ASVS aplicable a un cliente SPA con NextAuth. | Documento dedicado |
| **No funcional — accesibilidad (exploratoria)** | Detectada durante la automatización (no fue un objetivo inicial): nombres accesibles ausentes en acciones de tabla. Se documenta como hallazgo, no como suite formal de accesibilidad (fuera de alcance por tiempo). | DEF-05 en `analisis-riesgos-seguridad.md` |

**Fuera de alcance explícito de este componente:** pruebas de carga/rendimiento (JMeter/k6) y pruebas de API puras (Postman) — se asume que las cubre el equipo de backend, ya que este frontend es un consumidor delgado de esa API.

---

## 5. Enfoque basado en riesgo (Risk-Based Testing)

Matriz de priorización (Probabilidad × Impacto) usada para decidir dónde invertir el esfuerzo de automatización:

| Riesgo | Probabilidad | Impacto | Prioridad | Mitigación aplicada |
|---|---|---|---|---|
| Fuga de datos entre agencias (RBAC roto) | Media | Crítico | **P0** | Tests de rol en Auth y Agencias; revisión manual de `useUserRole` |
| Crash de página por desajuste de tipos backend↔frontend (IDs numéricos vs. `string`) | Alta (ya materializado 4 veces) | Alto | **P0** | Se corrigieron los 4 casos encontrados y se dejaron tests de regresión (`buscar sin coincidencias`) |
| Creación de agencia con RUC inválido | Baja (UI ya restringe) | Alto (dato regulatorio) | **P1** | Test de valor límite (10 vs. 11 dígitos) |
| Credenciales o tokens expuestos en cliente | Media | Alto | **P1** | Revisión OWASP dedicada (ver documento de seguridad) |
| Ruta de edición de viaje inalcanzable (dead code) | Alta (ya materializado) | Bajo | P2 | Documentado como defecto, no bloquea demo |
| Falta de suite unitaria | Alta | Medio | P2 | Reconocido como deuda técnica en §8 |

---

## 6. Criterios de entrada y salida

**Entrada:**
- Backend (`bustoke-admin-backend`) corriendo localmente contra la base de datos de desarrollo (Neon/Postgres), con al menos un usuario `superadmin` y un `admin_agencia` de prueba.
- Frontend corriendo en modo desarrollo (`npm run dev`) en `http://localhost:3000` (**no** `127.0.0.1`, ver defecto de entorno DEF-06).
- Variables de entorno de prueba (`.env.test`, no versionado) con credenciales de los usuarios de prueba.

**Salida (Definition of Done para este entregable):**
- `npx tsc --noEmit` y `npx eslint .` sin errores.
- `npx playwright test` en verde (20/20 al cierre de este documento).
- Los defectos de severidad alta encontrados en código (DEF-01, DEF-02, DEF-03, DEF-05) corregidos y con test de regresión; los defectos menores no corregidos (DEF-04, DEF-06, DEF-07) documentados explícitamente en `analisis-riesgos-seguridad.md`.
- Pipeline de CI (`.github/workflows/ci.yml`) ejecutando lint + typecheck + Playwright en cada push/PR.

---

## 7. Integración a pipeline CI/CD

`.github/workflows/ci.yml` define 3 jobs sobre GitHub Actions:

1. **`static-checks`** (siempre corre): `tsc --noEmit`, `eslint .`, `npm audit --audit-level=high`. Falla el pipeline ante cualquier error de tipos, lint o una vulnerabilidad de severidad alta/crítica nueva.
2. **`build`** (siempre corre, depende de 1): `next build` de producción.
3. **`e2e`** (opcional, depende de 1): ejecuta la suite Playwright completa contra un ambiente real. Solo se activa si el repositorio tiene la variable `E2E_ENABLED=true` y los *secrets* `E2E_BASE_URL`, `E2E_SUPERADMIN_EMAIL`, `E2E_SUPERADMIN_PASSWORD`, `E2E_AGENCIA_ADMIN_EMAIL`, `E2E_AGENCIA_ADMIN_PASSWORD` configurados (Settings → Secrets and variables → Actions), apuntando a un ambiente de staging con backend accesible desde internet. Sin esa configuración, el job se omite limpiamente en vez de fallar — se documenta así en vez de simular una integración que no puede ejecutarse de verdad sin un ambiente desplegado, algo fuera del alcance de este componente del proyecto integrador (el backend vive en un repositorio hermano).

Localmente, la suite E2E completa se ejecuta con:
```bash
npm run dev            # frontend en :3000
# backend corriendo aparte en :5000
npx playwright test    # o npm run test:e2e
```

## 8. Riesgos del propio plan de pruebas / deuda técnica reconocida

- **No hay pruebas unitarias**: los componentes no tienen cobertura de pruebas de componente aislado (React Testing Library). Se decidió priorizar E2E contra sistema real porque, dado el tiempo disponible del proyecto integrador, detecta más defectos reales por hora invertida en una aplicación tipo CRUD-sobre-API como esta (se validó empíricamente: los 4 defectos críticos encontrados solo eran detectables con datos reales del backend, no con mocks).
- **La suite depende de datos sembrados** (seed data) en la base de datos de desarrollo; no es hermética/determinista al 100% como lo sería con una base de datos efímera por corrida. Riesgo aceptado para este entregable académico; recomendación a futuro: contenedor Postgres desechable + fixtures por test.
- **Cobertura de módulos**: por restricción de tiempo, se automatizaron Auth, Viajes, Agencias y Reclamos (los de mayor riesgo de negocio, §5). Boletos, Pasajeros, Comisiones, Suscripciones, Flota, Terminales, Rutas y Reportes quedan con prueba manual exploratoria únicamente — documentado como alcance futuro, no oculto.
