import { expect, test } from '@playwright/test';
import { appearance, login } from './helpers';

test('customer creation dialogs remain usable on narrow screens in Arabic and English', async ({
  page,
}) => {
  test.setTimeout(150000);
  await login(page);

  for (const language of ['ar', 'en'] as const) {
    await appearance(page, language === 'ar' ? 'dark' : 'light');
    for (const width of [320, 360]) {
      await page.setViewportSize({ width, height: 640 });
      for (const feature of [
        { route: 'goals', english: 'New goal', arabic: 'هدف جديد' },
        { route: 'projects', english: 'New project', arabic: 'مشروع جديد' },
        { route: 'tasks', english: 'New task', arabic: 'مهمة جديدة' },
        { route: 'quests', english: 'New quest', arabic: 'مهمة أسبوعية جديدة' },
        { route: 'rewards', english: 'Personal reward', arabic: 'مكافأة شخصية' },
        { route: 'challenges', english: 'New challenge', arabic: 'تحدٍ جديد' },
        { route: 'habits', english: 'New habit', arabic: 'عادة جديدة' },
        { route: 'friends', english: 'Add a friend', arabic: 'إضافة صديق' },
      ]) {
        await page.goto(`/${feature.route}`);
        await expect(page.locator('html')).toHaveAttribute('lang', language);
        await page
          .getByRole('button', {
            name: language === 'ar' ? feature.arabic : feature.english,
            exact: true,
          })
          .first()
          .click();
        const dialog = page.getByRole('dialog').first();
        await expect(dialog).toBeVisible();
        const layout = await dialog.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return {
            left: bounds.left,
            right: bounds.right,
            contentOverflow: element.scrollWidth > element.clientWidth + 1,
            pageOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          };
        });
        expect(
          layout.left,
          `${feature.route} ${language} ${width}px left edge`,
        ).toBeGreaterThanOrEqual(-1);
        expect(
          layout.right,
          `${feature.route} ${language} ${width}px right edge`,
        ).toBeLessThanOrEqual(width + 1);
        expect(
          layout.contentOverflow,
          `${feature.route} ${language} ${width}px dialog content`,
        ).toBe(false);
        expect(layout.pageOverflow, `${feature.route} ${language} ${width}px page`).toBe(false);
      }
    }
  }
});

test('admin creation dialogs remain usable on narrow screens in Arabic and English', async ({
  page,
}) => {
  test.setTimeout(150000);
  await login(page, true);

  for (const language of ['ar', 'en'] as const) {
    await appearance(page, language === 'ar' ? 'dark' : 'light', true);
    for (const width of [320, 360]) {
      await page.setViewportSize({ width, height: 640 });
      for (const route of [
        'quests',
        'content/rewards',
        'content/achievements',
        'content/help',
        'content/announcements',
      ]) {
        await page.goto(`http://localhost:4301/${route}`);
        await expect(page.locator('html')).toHaveAttribute('lang', language);
        await page
          .getByRole('button', {
            name:
              route === 'quests'
                ? language === 'ar'
                  ? 'قالب جديد'
                  : 'New template'
                : language === 'ar'
                  ? 'إنشاء جديد'
                  : 'Create new',
            exact: true,
          })
          .first()
          .click();
        const dialog = page.getByRole('dialog').first();
        await expect(dialog).toBeVisible();
        const layout = await dialog.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return {
            left: bounds.left,
            right: bounds.right,
            contentOverflow: element.scrollWidth > element.clientWidth + 1,
            pageOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          };
        });
        expect(layout.left, `${route} ${language} ${width}px left edge`).toBeGreaterThanOrEqual(-1);
        expect(layout.right, `${route} ${language} ${width}px right edge`).toBeLessThanOrEqual(
          width + 1,
        );
        expect(layout.contentOverflow, `${route} ${language} ${width}px dialog content`).toBe(
          false,
        );
        expect(layout.pageOverflow, `${route} ${language} ${width}px page`).toBe(false);
      }
    }
  }
});
