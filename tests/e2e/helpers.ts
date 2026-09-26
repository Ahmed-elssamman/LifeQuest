import { expect, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
export const credentials = () =>
  JSON.parse(readFileSync('.local/e2e-credentials.json', 'utf8')) as {
    email: string;
    password: string;
    adminEmail: string;
    adminPassword: string;
  };
export async function login(page: Page, admin = false) {
  const user = credentials();
  await page.goto(admin ? 'http://localhost:4301/auth/login' : '/auth/login');
  await page.locator('#email').fill(admin ? user.adminEmail : user.email);
  await page.locator('#password').fill(admin ? user.adminPassword : user.password);
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL(admin ? /\/overview$/ : /\/dashboard$/);
}
export async function appearance(page: Page, mode: 'light' | 'dark', admin = false) {
  const origin = admin ? 'http://localhost:4301' : 'http://localhost:4300';
  const response = await page.request.patch(origin + '/api/profile', {
    headers: { Origin: origin },
    data: { language: mode === 'dark' ? 'ar' : 'en', theme: mode },
  });
  expect(response.ok()).toBe(true);
}
