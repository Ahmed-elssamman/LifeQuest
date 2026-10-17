import { expect, test } from '@playwright/test';
import { renderAuthEmail } from '../../apps/api/src/auth/mail.templates';

const link = `https://web.example.test/auth/reset-password?token=${'A'.repeat(64)}`;

for (const language of ['ar', 'en'] as const) {
  test(`${language} auth email stays within a narrow viewport`, async ({ page }) => {
    const { html } = renderAuthEmail('RESET_PASSWORD', language, link);
    await page.setViewportSize({ width: 320, height: 720 });
    await page.setContent(html);
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);
    const action = page.getByRole('link', {
      name: language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset password',
    });
    const bounds = await action.boundingBox();
    if (!bounds) throw new Error('Email action is not visible.');
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  });
}
