import { test, expect } from '@playwright/test';
import { inspectLayout } from './helpers';

test('public customer and admin auth pages fit every supported width in both languages', async ({
  page,
}) => {
  test.setTimeout(150000);
  for (const application of [
    {
      name: 'web',
      origin: 'http://localhost:4300',
      routes: [
        '',
        'auth/login',
        'auth/register',
        'auth/forgot-password',
        'auth/reset-password',
        'auth/verify-email',
      ],
    },
    { name: 'admin', origin: 'http://localhost:4301', routes: ['auth/login'] },
  ]) {
    for (const language of ['ar', 'en'] as const) {
      await page.goto(application.origin + '/auth/login');
      await page.evaluate((value) => localStorage.setItem('lq-language', value), language);
      for (const route of application.routes) {
        await page.goto(`${application.origin}/${route}`);
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('lang', language);
        await expect(page.locator('html')).toHaveAttribute(
          'dir',
          language === 'ar' ? 'rtl' : 'ltr',
        );
        await inspectLayout(page, application.name, route || 'landing', language);
      }
    }
  }
});
