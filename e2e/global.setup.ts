import { test as setup, expect, type Page } from '@playwright/test';
import path from 'path';

const SUPERADMIN_FILE = path.resolve(__dirname, '.auth/user.json');
const AGENCIA_ADMIN_FILE = path.resolve(__dirname, '.auth/agencia-admin.json');

async function login(page: Page, email: string, password: string) {
  await page.goto('/iniciar-sesion');
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Correo').fill(email);
  await page.getByLabel(/^Contraseña/).fill(password);
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: /Panel de Administraci/i })).toBeVisible();
}

setup('autenticar como superadmin', async ({ page }) => {
  const email = process.env.E2E_SUPERADMIN_EMAIL;
  const password = process.env.E2E_SUPERADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Faltan E2E_SUPERADMIN_EMAIL / E2E_SUPERADMIN_PASSWORD en .env.test');
  }

  await login(page, email, password);
  await page.context().storageState({ path: SUPERADMIN_FILE });
});

setup('autenticar como admin de agencia', async ({ page }) => {
  const email = process.env.E2E_AGENCIA_ADMIN_EMAIL;
  const password = process.env.E2E_AGENCIA_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Faltan E2E_AGENCIA_ADMIN_EMAIL / E2E_AGENCIA_ADMIN_PASSWORD en .env.test');
  }

  await login(page, email, password);
  await page.context().storageState({ path: AGENCIA_ADMIN_FILE });
});
