import { test, expect } from '@playwright/test';

test.describe('Gestión de Agencias (superadmin)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agencias');
    await page.waitForLoadState('networkidle');
  });

  // TC-AGE-01 (nivel: sistema / humo)
  test('la lista de agencias carga y muestra filas', async ({ page }) => {
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  // TC-AGE-02 (control de acceso: el botón de creación solo es visible para superadmin)
  test('el botón "Nueva agencia" es visible para superadmin', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Nueva agencia' })).toBeVisible();
  });

  // TC-AGE-03 (caja negra: valor límite - RUC con menos de 11 dígitos)
  test('RUC con 10 dígitos deja el botón "Crear agencia" deshabilitado', async ({ page }) => {
    await page.getByRole('button', { name: 'Nueva agencia' }).click();
    await page.getByPlaceholder('12345678901').fill('1234567890');
    await page.getByPlaceholder('Empresa de Transportes S.A.C.').fill('Empresa QA de Prueba');

    await expect(page.getByText('El RUC debe tener 11 dígitos')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Crear agencia' })).toBeDisabled();
  });

  // TC-AGE-04 (caja negra: valor límite - RUC exactamente en 11 dígitos, camino feliz)
  test('crear una agencia con RUC de 11 dígitos válido', async ({ page }) => {
    const ruc = `9${Date.now().toString().slice(-10)}`;
    await page.getByRole('button', { name: 'Nueva agencia' }).click();
    await page.getByPlaceholder('12345678901').fill(ruc);
    await page.getByPlaceholder('Empresa de Transportes S.A.C.').fill(`Empresa QA ${Date.now()}`);

    await expect(page.getByText('El RUC debe tener 11 dígitos')).toHaveCount(0);
    const crearBtn = page.getByRole('button', { name: 'Crear agencia' });
    await expect(crearBtn).toBeEnabled();
    await crearBtn.click();

    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 10_000 });
    await expect(page.getByText(ruc)).toBeVisible();
  });

  // TC-AGE-05 (caja negra: navegación)
  test('ver el detalle de una agencia desde la tabla', async ({ page }) => {
    await page.getByRole('button', { name: 'Ver detalle' }).first().click();
    await expect(page).toHaveURL(/\/agencias\/[^/]+$/);
    // El botón "Editar" del detalle usa el patrón asChild (Button asChild > Link),
    // por lo que su rol accesible es "link", a diferencia de los íconos de la
    // tabla (Link > Button), cuyo rol es "button". Ver DEF-02 en el informe.
    await expect(page.getByRole('link', { name: 'Editar' })).toBeVisible();
  });
});

test.describe('Gestión de Agencias (admin de agencia)', () => {
  test.use({ storageState: 'e2e/.auth/agencia-admin.json' });

  // TC-AGE-06 (control de acceso: admin de agencia no puede crear agencias)
  test('el botón "Nueva agencia" no está disponible para admin de agencia', async ({ page }) => {
    await page.goto('/agencias');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'Nueva agencia' })).toHaveCount(0);
  });
});
