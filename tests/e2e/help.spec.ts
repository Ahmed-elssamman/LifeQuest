import { expect, test } from '@playwright/test';

test('the complete learning journey supports keyboard selection, simple mode and reduced motion in RTL', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/help');
  const navigation = page.getByRole('navigation', { name: 'Explore the journey' });
  await expect(navigation.getByRole('button')).toHaveCount(4);
  const steps = [
    ['Goal', 'Choose a meaningful goal'],
    ['Project', 'Give it a project'],
    ['Task', 'Find the next clear action'],
    ['Habit', 'Build your daily rhythm'],
    ['Daily check-in', 'Check in with yourself'],
    ['Quest', 'Take on a weekly quest'],
    ['XP', 'Let progress add up'],
    ['Level', 'Reach a new level'],
    ['Achievement', 'Celebrate meaningful achievements'],
    ['Reward', 'Make room for enjoyment'],
    ['Challenge', 'Grow a little, together'],
    ['Monthly review', 'See the season you are building'],
  ];
  for (const [label, heading] of steps) {
    const button = page.getByRole('button', { name: label, exact: true });
    await button.focus();
    await button.press('Enter');
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('article').getByRole('heading', { name: heading })).toBeVisible();
  }
  await expect(navigation.getByRole('button')).toHaveCount(15);
  for (const title of ['Make rewards more personal', 'Keep your journey yours']) {
    const button = navigation.getByRole('button', { name: title });
    await button.click();
    await expect(button).toHaveAttribute('aria-current', 'step');
    await expect(page.locator('article h2')).toHaveText(title);
  }
  await page.getByRole('button', { name: /The whole journey/ }).click();
  await expect(navigation.getByRole('button')).toHaveCount(4);
  await expect(page.locator('article h2')).toHaveText('Choose a meaningful goal');
  await page.getByRole('button', { name: 'ع', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: 'مستوى', exact: true }).press('Space');
  await expect(page.locator('article h2')).toHaveText('صل إلى مستوى جديد');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.getAnimations().filter((animation) => animation.playState === 'running').length,
      ),
    )
    .toBe(0);
});
