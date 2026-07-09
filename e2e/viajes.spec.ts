import { test, expect } from '@playwright/test';

test.describe('Gestión de Viajes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/viajes');
    await page.waitForLoadState('networkidle');
  });

  // TC-VIA-01 (nivel: sistema / humo)
  test('la lista de viajes carga y muestra filas', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Viajes' })).toBeVisible();
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  // TC-VIA-02 (caja negra: filtro de búsqueda, clase de equivalencia "sin resultados")
  test('buscar un viaje con texto sin coincidencias no rompe la tabla', async ({ page }) => {
    await page.getByPlaceholder('Buscar viaje...').fill('xxx-texto-que-no-existe-nunca-xxx');
    await expect(page.getByText('Sin resultados')).toBeVisible();

    await page.getByRole('button', { name: 'Limpiar' }).click();
    await expect(page.getByPlaceholder('Buscar viaje...')).toHaveValue('');
    await expect(page.getByText('Sin resultados')).toHaveCount(0);
  });

  // TC-VIA-03 (caja negra: flujo CRUD completo - crear)
  test('crear un nuevo viaje con datos válidos', async ({ page }) => {
    await page.getByRole('button', { name: 'Nuevo Viaje' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const origenSelect = page.locator('#origen');
    await origenSelect.selectOption({ index: 1 });

    const destinoSelect = page.locator('#destino');
    await expect(destinoSelect.locator('option')).not.toHaveCount(1, { timeout: 10_000 });
    await destinoSelect.selectOption({ index: 1 });

    await page.locator('#idBus').selectOption({ index: 1 });
    await page.locator('#idChofer').selectOption({ index: 1 });

    const salida = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const llegada = new Date(salida.getTime() + 4 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().slice(0, 16);

    await page.locator('#fechaHoraSalida').fill(fmt(salida));
    await page.locator('#fechaHoraLlegada').fill(fmt(llegada));
    await page.locator('#rampaEmbarque').fill(`Andén QA-${Date.now()}`);

    await page.getByRole('button', { name: 'Crear viaje' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 10_000 });
  });

  // TC-VIA-04 (caja negra: navegación al detalle)
  // NOTA: el detalle de viaje no tiene botón "Editar" (a diferencia de Agencias);
  // la ruta /viajes/[id]/editar existe en el código pero no está enlazada desde
  // ninguna pantalla, por lo que es inalcanzable para un usuario real (DEF-03).
  test('ver el detalle de un viaje desde la tabla', async ({ page }) => {
    await page.getByRole('button', { name: 'Ver detalle' }).first().click();
    await expect(page).toHaveURL(/\/viajes\/[^/]+$/);
    await expect(page.getByRole('main').getByRole('link', { name: 'Boletos' }).or(page.getByText('Viaje no encontrado'))).toBeVisible();
  });
});
