/* global document, window */
import 'dotenv/config';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('.local/screenshots', { recursive: true });
const browser = await chromium.launch({ headless: true });
const findings = [];
try {
  for (const admin of [false, true]) {
    const base = admin
      ? (process.env['VERCEL_ADMIN_ORIGIN'] ?? 'http://localhost:4201')
      : (process.env['VERCEL_WEB_ORIGIN'] ?? 'http://localhost:4200');
    const email = process.env[admin ? 'DEMO_ADMIN_EMAIL' : 'DEMO_EMAIL'];
    const password = process.env[admin ? 'DEMO_ADMIN_PASSWORD' : 'DEMO_PASSWORD'];
    assert.ok(email && password, 'Configure demo credentials in .env before the live smoke check.');
    const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const health = await page.request.get(base + '/api/health');
    assert.equal(health.status(), 200, 'The API proxy and database are healthy.');
    await page.goto(base + '/auth/login');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.locator('button[type=submit]').click();
    await page.waitForURL(admin ? '**/overview' : '**/dashboard');
    const routes = admin
      ? ['overview', 'users', 'challenges', 'feedback', 'quests', 'health']
      : ['dashboard', 'today', 'goals', 'projects', 'habits', 'habit-lab', 'journey'];
    for (const route of routes) {
      await page.goto(base + '/' + route);
      await page.locator('h1').waitFor();
      await page.waitForFunction(() => !document.querySelector('lq-skeleton'));
      assert.equal(await page.locator('lq-error').count(), 0, `The ${route} read succeeds.`);
    }
    await page.goto(base + (admin ? '/overview' : '/dashboard'));
    await page.waitForFunction(
      () => document.querySelector('h1') && !document.querySelector('lq-skeleton'),
    );
    await page.screenshot({
      path: `.local/screenshots/live-${admin ? 'admin' : 'dashboard'}.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 320, height: 844 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
      false,
      'No horizontal overflow at 320px.',
    );
    assert.deepEqual(errors, [], 'No browser runtime errors.');
    findings.push({
      application: admin ? 'admin' : 'web',
      checkedRoutes: routes.length,
      healthy: true,
      mobileOverflow: false,
    });
    await page.close();
  }
  console.log(JSON.stringify(findings));
} finally {
  await browser.close();
}
