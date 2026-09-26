/* global document, window */
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const user = JSON.parse(readFileSync('.local/e2e-credentials.json', 'utf8'));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 320, height: 900 } });
await page.goto('http://localhost:4300/auth/login');
await page.locator('#email').fill(user.email);
await page.locator('#password').fill(user.password);
await page.locator('button[type=submit]').click();
await page.waitForURL('**/dashboard');
await page.goto('http://localhost:4300/today');
await page.locator('lq-habit-row').first().waitFor();
console.log(
  JSON.stringify(
    await page.evaluate(() => ({
      width: window.innerWidth,
      scroll: document.documentElement.scrollWidth,
      overflow: [...document.querySelectorAll('body *')]
        .filter((element) => element.getBoundingClientRect().right > window.innerWidth + 1)
        .slice(0, 12)
        .map((element) => ({
          tag: element.tagName,
          class: element.className,
          width: element.getBoundingClientRect().width,
        })),
    })),
  ),
);
await page.screenshot({ path: '.local/screenshots/today-320.png', fullPage: true });
await browser.close();
