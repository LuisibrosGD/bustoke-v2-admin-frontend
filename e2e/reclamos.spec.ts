import { test, expect } from '@playwright/test';

test.describe('Reclamos y Quejas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reclamos');
    await page.waitForLoadState('networkidle');
  });

  // TC-REC-01 (nivel: sistema / humo)
  test('la lista de reclamos carga', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Reclamos y Quejas' })).toBeVisible();
  });

  // TC-REC-02 (caja negra: navegación y cambio de estado - transición de estados)
  test('ver el detalle de un reclamo y cambiar su estado', async ({ page }) => {
    const rows = page.locator('table tbody tr');
    test.skip((await rows.count()) === 0, 'No hay reclamos sembrados para probar este flujo');

    const estadoSelect = rows.first().locator('select');
    const estadoOriginal = await estadoSelect.inputValue();
    const nuevoEstado = estadoOriginal === 'resuelto' ? 'abierto' : 'resuelto';

    await estadoSelect.selectOption(nuevoEstado);
    await page.waitForLoadState('networkidle');
    await expect(rows.first().locator('select')).toHaveValue(nuevoEstado);
  });
});
