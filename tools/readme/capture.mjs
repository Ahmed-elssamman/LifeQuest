/* global localStorage, document */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

// Only public pages are captured: no accounts, cookies or private fixture data.
const origin = process.env['README_ORIGIN'] ?? 'https://lifequest-web-cyan.vercel.app';
await mkdir('docs/media', { recursive: true });
const browser = await chromium.launch();
try {
  for (const [name, language, theme, width, height] of [
    ['landing', 'en', 'light', 1440, 960],
    ['arabic-dark', 'ar', 'dark', 1440, 960],
    ['mobile', 'en', 'light', 390, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
      serviceWorkers: 'block',
      colorScheme: theme,
    });
    await context.addInitScript(
      ({ language, theme }) => {
        localStorage.setItem('lq-language', language);
        localStorage.setItem('lq-theme', theme);
      },
      { language, theme },
    );
    const page = await context.newPage();
    const response = await page.goto(origin, { waitUntil: 'networkidle' });
    if (!response?.ok()) throw new Error('The public homepage is unavailable.');
    await page.locator('h1').waitFor();
    await page.waitForFunction((language) => document.documentElement.lang === language, language);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `docs/media/${name}.png` });
    await context.close();
    console.log(`Captured public ${name} preview.`);
  }
} finally {
  await browser.close();
}
