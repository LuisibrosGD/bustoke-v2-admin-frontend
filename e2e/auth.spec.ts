import { test, expect } from '@playwright/test';

// Estos tests validan el flujo de autenticación desde cero, por lo que
// arrancan sin la sesión guardada por global.setup.ts.
test.use({ storageState: { cookies: [], origins: [] } });

const SUPERADMIN_EMAIL = process.env.E2E_SUPERADMIN_EMAIL!;
const SUPERADMIN_PASSWORD = process.env.E2E_SUPERADMIN_PASSWORD!;
const AGENCIA_ADMIN_EMAIL = process.env.E2E_AGENCIA_ADMIN_EMAIL!;
const AGENCIA_ADMIN_PASSWORD = process.env.E2E_AGENCIA_ADMIN_PASSWORD!;

async function goToLogin(page: import('@playwright/test').Page) {
  await page.goto('/iniciar-sesion');
  await page.waitForLoadState('networkidle');
}

test.describe('Autenticación', () => {
  // TC-AUTH-01 (caja negra, camino feliz)
  test('login exitoso con credenciales válidas redirige al dashboard', async ({ page }) => {
    await goToLogin(page);
    await page.getByLabel('Correo').fill(SUPERADMIN_EMAIL);
    await page.getByLabel(/^Contraseña/).fill(SUPERADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /Panel de Administraci/i })).toBeVisible();
  });

  // TC-AUTH-02 (caja negra, valor inválido - clase de equivalencia negativa)
  test('login con contraseña incorrecta muestra error y no navega', async ({ page }) => {
    await goToLogin(page);
    await page.getByLabel('Correo').fill(SUPERADMIN_EMAIL);
    await page.getByLabel(/^Contraseña/).fill('ContraseñaIncorrecta123!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page.getByText('Error al iniciar sesión')).toBeVisible();
    await expect(page).toHaveURL(/\/iniciar-sesion/);
  });

  // TC-AUTH-03 (validación de formulario - caja negra, valor inválido)
  // NOTA / hallazgo: el input usa type="email", por lo que el navegador
  // intercepta el envío con su validación nativa (tooltip en inglés) antes
  // de que se ejecute la validación Zod en español ("Por favor, introduce
  // un email válido."). El mensaje de Zod queda inalcanzable por esta vía.
  // Ver DEF-01 en el informe de riesgos/defectos.
  test('login con email con formato inválido no navega (bloqueado por validación nativa del input)', async ({ page }) => {
    await goToLogin(page);
    await page.getByLabel('Correo').fill('no-es-un-correo');
    await page.getByLabel(/^Contraseña/).fill('cualquierpassword');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page.getByLabel('Correo')).toHaveJSProperty('validity.valid', false);
    await expect(page).toHaveURL(/\/iniciar-sesion/);
  });

  // TC-AUTH-04 (valor límite: contraseña de 7 caracteres, bajo el mínimo de 8)
  test('login con contraseña menor al mínimo de 8 caracteres muestra error de validación', async ({ page }) => {
    await goToLogin(page);
    await page.getByLabel('Correo').fill(SUPERADMIN_EMAIL);
    await page.getByLabel(/^Contraseña/).fill('short12');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page.getByText('La contraseña debe tener al menos 8 caracteres.')).toBeVisible();
    await expect(page).toHaveURL(/\/iniciar-sesion/);
  });

  // TC-AUTH-05 (control de acceso / gestión de sesión)
  test('acceder a una ruta protegida sin sesión redirige a login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/iniciar-sesion/);
  });

  // TC-AUTH-06 (control de acceso basado en rol - RBAC)
  test('admin de agencia no ve la sección "Agencias" en el menú', async ({ page }) => {
    await goToLogin(page);
    await page.getByLabel('Correo').fill(AGENCIA_ADMIN_EMAIL);
    await page.getByLabel(/^Contraseña/).fill(AGENCIA_ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('link', { name: 'Agencias' })).toHaveCount(0);
  });
});
