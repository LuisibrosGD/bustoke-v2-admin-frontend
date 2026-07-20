import { test, expect } from '@playwright/test';

test.describe('Buscador global', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
  });

  // TC-SEARCH-01 (caja negra: navegación)
  test('busca una agencia y navega a su detalle', async ({ page }) => {
    await page.getByRole('button', { name: /Buscar/ }).click();
    await expect(page.getByPlaceholder(/Buscar viajes/)).toBeVisible();
    await page.getByPlaceholder(/Buscar viajes/).fill('oltursa');
    await expect(page.getByText('TRANSPORTES OLTURSA S.A.C.')).toBeVisible({ timeout: 8_000 });
    await page.getByText('TRANSPORTES OLTURSA S.A.C.').click();
    await expect(page).toHaveURL(/\/agencias\/\d+/);
  });

  // TC-SEARCH-02 (atajo de teclado)
  test('Cmd/Ctrl+K abre el buscador', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await expect(page.getByPlaceholder(/Buscar viajes/)).toBeVisible();
  });

  // TC-SEARCH-03 (caja negra: clase de equivalencia "sin resultados")
  test('muestra estado vacío cuando no hay coincidencias', async ({ page }) => {
    await page.getByRole('button', { name: /Buscar/ }).click();
    await page.getByPlaceholder(/Buscar viajes/).fill('xxxxnoexiste123');
    await expect(page.getByText(/No se encontraron resultados/)).toBeVisible({ timeout: 8_000 });
  });

  // TC-SEARCH-04 (valor límite: 1 caracter no dispara búsqueda)
  test('no busca con un solo carácter', async ({ page }) => {
    await page.getByRole('button', { name: /Buscar/ }).click();
    await page.getByPlaceholder(/Buscar viajes/).fill('a');
    await expect(page.getByText('Escribe al menos 2 caracteres.')).toBeVisible();
  });
});

test.describe('Buscador global — control de acceso por rol', () => {
  test.use({ storageState: 'e2e/.auth/agencia-admin.json' });

  // TC-SEARCH-05 (RBAC: un admin de agencia no encuentra datos de otra agencia)
  test('admin de agencia no encuentra agencias ajenas en el buscador', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Buscar/ }).click();
    await page.getByPlaceholder(/Buscar viajes/).fill('oltursa');
    await expect(page.getByText(/No se encontraron resultados/)).toBeVisible({ timeout: 8_000 });
  });
});
