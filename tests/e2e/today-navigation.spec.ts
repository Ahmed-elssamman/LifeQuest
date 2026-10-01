import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('Today shows one next step and keeps advanced planning reachable on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await expect(page).toHaveURL(/\/today$/);

  const nextStep = page.locator('section[aria-labelledby="next-step-title"]');
  await expect(nextStep).toBeVisible();
  await expect(nextStep.locator('h2')).not.toBeEmpty();
  await expect(nextStep.getByRole('button', { name: 'Mark done' })).toBeVisible();

  const quick = page.getByRole('navigation', { name: 'Quick navigation' });
  await expect(quick.getByRole('link')).toHaveCount(5);
  for (const name of ['Home', 'Today', 'Journey', 'Rewards', 'Challenges']) {
    await expect(quick.getByRole('link', { name, exact: true })).toBeVisible();
  }

  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: 'More' }).click();
  await page.getByRole('link', { name: 'Habits', exact: true }).click();
  await expect(page).toHaveURL(/\/habits$/);
  await expect(page.locator('h1')).toBeVisible();

  await page.setViewportSize({ width: 812, height: 375 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
});
