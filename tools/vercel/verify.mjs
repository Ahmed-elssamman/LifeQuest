/* global document, window */
import { config } from 'dotenv';
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
config({ quiet: true });
const web = process.env['VERCEL_WEB_ORIGIN'];
const admin = process.env['VERCEL_ADMIN_ORIGIN'];
assert.ok(web && admin, 'Configure VERCEL_WEB_ORIGIN and VERCEL_ADMIN_ORIGIN.');
const browser = await chromium.launch();
const context = await browser.newContext({
  baseURL: web,
  serviceWorkers: 'block',
  viewport: { width: 1280, height: 900 },
});
const page = await context.newPage();
await page.addInitScript(() => window.localStorage.setItem('lq-language', 'en'));
page.setDefaultTimeout(30000);
const email = `deployment-${randomBytes(8).toString('hex')}@example.test`;
const password = randomBytes(24).toString('base64url');
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
let registered = false;
try {
  for (const origin of [web, admin]) {
    const health = await page.request.get(`${origin}/api/health`);
    assert.equal(health.status(), 200);
    assert.equal((await health.json()).status, 'ok');
  }
  await page.goto('/auth/register');
  await page.locator('#displayName').fill('New Explorer');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL(/onboarding$/);
  registered = true;
  const cookie = (await context.cookies(web + '/api')).find((item) => item.name === 'lq_session');
  assert.ok(cookie?.httpOnly && cookie?.secure && cookie?.sameSite === 'Lax');
  console.log('Production registration and secure session passed.');
  await page.getByRole('button', { name: 'Growth', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.getByRole('button', { name: 'Begin my journey' }).click();
  await expect(page).toHaveURL(/today$/);
  await page.goto('/goals');
  await page.getByRole('button', { name: 'New goal', exact: true }).click();
  await page.locator('#goal-title').fill('Build my portfolio');
  await page.locator('#goal-strategy').selectOption('MILESTONE');
  await page.getByRole('button', { name: 'Save goal', exact: true }).click();
  const goal = page.locator('article').filter({ hasText: 'Build my portfolio' });
  await expect(goal).toBeVisible();
  await goal.locator('summary').click();
  await goal.getByRole('textbox', { name: 'New milestone' }).fill('Publish the first case study');
  await goal.getByRole('button', { name: 'Add milestone' }).click();
  await goal.getByRole('checkbox', { name: 'Publish the first case study' }).check();
  await expect(goal).toContainText('100%');
  await page.goto('/projects');
  await page.getByRole('button', { name: 'New project', exact: true }).click();
  await page.locator('#project-title').fill('Portfolio website');
  await page.locator('#project-goal').selectOption({ label: 'Build my portfolio' });
  await page.locator('p-dialog button[type=submit]').click();
  await expect(page.getByRole('heading', { name: 'Portfolio website' })).toBeVisible();
  await page.goto('/tasks');
  await page.getByRole('button', { name: 'New task', exact: true }).click();
  await page.locator('#task-title').fill('Draft the introduction');
  await page.locator('#task-project').selectOption({ label: 'Portfolio website' });
  await page.locator('p-dialog button[type=submit]').click();
  await page.getByRole('button', { name: 'Complete Draft the introduction', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Reopen Draft the introduction', exact: true }),
  ).toBeVisible();
  await page.goto('/habits');
  await page.getByRole('button', { name: 'New habit', exact: true }).click();
  await page.locator('#habit-name').fill('Read a little');
  await page.locator('#habit-goal').selectOption({ label: 'Build my portfolio' });
  await page.getByRole('button', { name: 'Save my habit', exact: true }).click();
  const habit = page.locator('article').filter({ hasText: 'Read a little' });
  await habit.getByRole('button', { name: /Complete habit/ }).click();
  await expect(habit).toContainText('A little win, recorded');
  console.log('Goal, project, task and habit completion passed.');
  await page.goto('/today');
  await page.locator('#checkin-win').fill('I made a start');
  await page.locator('lq-check-in button[type=submit]').click();
  await expect(page.getByText('You made space for yourself.', { exact: true })).toBeVisible();
  await page.goto('/quests');
  await page.getByRole('button', { name: 'New quest', exact: true }).click();
  await page.locator('#quest-title').fill('One meaningful step');
  await page.locator('#quest-items').fill('Review my work');
  await page.locator('p-dialog button[type=submit]').click();
  const quest = page.locator('article').filter({ hasText: 'One meaningful step' });
  await quest.getByRole('button', { name: /Review my work/ }).click();
  await expect(quest).toContainText('100%');
  await page.goto('/rewards');
  await page
    .getByRole('button', { name: /personal reward/i })
    .first()
    .click();
  await page.locator('#reward-title').fill('A quiet coffee');
  await page.locator('#reward-cost').fill('50');
  await page.locator('p-dialog button[type=submit]').click();
  await page
    .locator('article')
    .filter({ hasText: 'A quiet coffee' })
    .getByRole('button', { name: 'Enjoy this reward', exact: true })
    .click();
  await page
    .getByRole('alertdialog', { name: 'You’ve earned a little joy.' })
    .getByRole('button', { name: 'Enjoy this reward', exact: true })
    .click();
  await expect(page.getByText('A quiet coffee').last()).toBeVisible();
  console.log('Daily reflection, quest and reward redemption passed.');
  await page.goto('/feedback');
  await page.locator('#feedback-title').fill('Make the next step clearer');
  await page
    .locator('#feedback-description')
    .fill('I would like more examples for the monthly review.');
  await page.locator('button[type=submit]').click();
  await expect(page.getByText('Make the next step clearer').last()).toBeVisible();
  const conversation = page.locator('article').filter({ hasText: 'Make the next step clearer' });
  await conversation.locator('input[type=file]').setInputFiles('apps/web/public/icon-192.png');
  await expect(conversation.getByRole('link', { name: 'icon-192.png', exact: true })).toBeVisible();
  await page.goto('/profile');
  await page.getByRole('radio', { name: 'dawn', exact: true }).focus();
  await page.getByRole('radio', { name: 'dawn', exact: true }).press('Space');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.getByText('Your profile is up to date.', { exact: true })).toBeVisible();
  await page.goto('/journey');
  await page.locator('#journey-win').fill('I kept the smallest promise.');
  await page.getByRole('button', { name: 'Save this chapter', exact: true }).click();
  await expect(page.getByText('A thought worth keeping. Saved.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('#journey-win')).toHaveValue('I kept the smallest promise.');
  await page.locator('#journey-win').fill('An unfinished reflection');
  await page.locator('aside').getByRole('link', { name: 'Today', exact: true }).click();
  await page
    .getByRole('alertdialog', { name: 'Keep your changes?' })
    .getByRole('button', { name: 'Keep editing', exact: true })
    .click();
  await expect(page).toHaveURL(/journey$/);
  await page.locator('aside').getByRole('link', { name: 'Today', exact: true }).click();
  await page
    .getByRole('alertdialog', { name: 'Keep your changes?' })
    .getByRole('button', { name: 'Discard changes', exact: true })
    .click();
  await expect(page).toHaveURL(/today$/);
  const conversations = await (await page.request.get('/api/feedback')).json();
  const conversationData = conversations.items.find(
    (item) => item.title === 'Make the next step clearer',
  );
  assert.ok(conversationData?.attachments?.length === 1);
  const attachmentPath = `/api/feedback/${conversationData.id}/attachments/${conversationData.attachments[0].id}`;
  const image = await page.request.get(attachmentPath);
  assert.equal(image.status(), 200);
  assert.equal(image.headers()['content-type'], 'image/png');
  const anonymous = await browser.newContext({ baseURL: web });
  assert.equal((await anonymous.request.get(attachmentPath)).status(), 401);
  await anonymous.close();
  console.log('Private durable upload and anonymous access protection passed.');
  const administrator = await browser.newContext({ baseURL: admin, serviceWorkers: 'block' });
  try {
    const adminPage = await administrator.newPage();
    adminPage.setDefaultTimeout(30000);
    adminPage.on('pageerror', (error) => errors.push(error.message));
    assert.ok(
      process.env['DEMO_ADMIN_EMAIL'] && process.env['DEMO_ADMIN_PASSWORD'],
      'Private admin credentials required for verification.',
    );
    await adminPage.goto('/auth/login');
    await adminPage.locator('#email').fill(process.env['DEMO_ADMIN_EMAIL']);
    await adminPage.locator('#password').fill(process.env['DEMO_ADMIN_PASSWORD']);
    await adminPage.locator('button[type=submit]').click();
    await expect(adminPage).toHaveURL(/overview$/);
    await adminPage.goto('/users');
    await expect(adminPage.getByRole('table')).toBeVisible();
    await adminPage.goto('/feedback');
    const conversation = adminPage
      .getByRole('button')
      .filter({ hasText: 'Make the next step clearer' })
      .first();
    await conversation.click();
    await adminPage.locator('#admin-feedback-status').selectOption('REVIEWING');
    await adminPage
      .locator('#admin-feedback-reply')
      .fill('Deployment verification: feedback delivery works.');
    await adminPage.locator('p-dialog button[type=submit]').click();
    await expect(conversation).toContainText(/reviewing/i);
    console.log('Admin sign-in, user inspection and feedback response passed.');
    await administrator.request.post('/api/auth/logout', { headers: { Origin: admin } });
  } finally {
    await administrator.close();
  }
  for (const width of [320, 360, 390, 412, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
      false,
      `Overflow at ${width}px`,
    );
  }
  assert.deepEqual(errors, []);
  console.log('Responsive layouts and browser runtime checks passed.');
} finally {
  if (registered) {
    const result = await page.request.post('/api/account/delete', {
      headers: { Origin: web },
      data: { password, confirmation: 'DELETE' },
    });
    assert.ok(result.ok(), 'Temporary verification account cleanup must succeed.');
    console.log('Temporary verification account and private attachments removed.');
  }
  await browser.close();
}
