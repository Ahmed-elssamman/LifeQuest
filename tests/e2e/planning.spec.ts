import { test, expect } from '@playwright/test';
import { login } from './helpers';

test('planning options persist, projects have milestones, and tasks break into smaller steps', async ({
  page,
}) => {
  await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/goals');
  await page.getByRole('button', { name: 'New goal', exact: true }).click();
  await page.locator('#goal-title').fill('Read twelve thoughtful books');
  await page.locator('#goal-strategy').selectOption('NUMERIC');
  await page.locator('#goal-value').fill('3');
  await page.locator('#goal-target').fill('12');
  await page.locator('#goal-unit').fill('books');
  await page.locator('p-dialog summary').click();
  await page.locator('#goal-start').fill('2026-09-01');
  await page.locator('#goal-priority').selectOption('HIGH');
  await page.locator('#goal-notes').fill('Take one useful idea from each book.');
  await page.getByRole('button', { name: 'Save goal', exact: true }).click();
  const goal = page.locator('article').filter({ hasText: 'Read twelve thoughtful books' });
  await expect(goal).toContainText('25%');
  await goal.getByRole('button', { name: 'Update goal', exact: true }).click();
  await expect(page.locator('#goal-unit')).toHaveValue('books');
  if (!(await page.locator('#goal-notes').isVisible()))
    await page.locator('p-dialog summary').click();
  await expect(page.locator('#goal-notes')).toHaveValue('Take one useful idea from each book.');
  await page.locator('#goal-status').selectOption('PAUSED');
  await page.getByRole('button', { name: 'Save goal', exact: true }).click();

  await page.goto('/projects');
  await page.getByRole('button', { name: 'New project', exact: true }).click();
  await page.locator('#project-title').fill('Make a reading corner');
  await page.locator('p-dialog summary').click();
  await page.locator('#project-start').fill('2026-09-01');
  await page.locator('#project-priority').selectOption('HIGH');
  await page.locator('#project-notes').fill('A chair and a lamp are enough.');
  await page.getByRole('button', { name: 'Save project', exact: true }).click();
  const project = page.locator('article').filter({ hasText: 'Make a reading corner' });
  await project.locator('summary').click();
  await project.getByRole('textbox', { name: 'New milestone' }).fill('Choose a quiet spot');
  await project.getByRole('button', { name: 'Add milestone' }).click();
  await project.getByRole('checkbox', { name: 'Choose a quiet spot' }).check();
  await project.getByRole('link', { name: 'View tasks', exact: true }).click();
  await page.getByRole('button', { name: 'New task', exact: true }).click();
  await page.locator('#task-title').fill('Set up the corner');
  await page.locator('p-dialog button[type=submit]').click();
  await page.getByRole('button', { name: 'Edit Set up the corner', exact: true }).click();
  await page.getByRole('button', { name: 'Break into a subtask', exact: true }).click();
  await page.locator('#task-title').fill('Move the lamp');
  await page.locator('p-dialog button[type=submit]').click();
  const child = page.locator('article').filter({ hasText: 'Move the lamp' });
  await expect(child).toContainText('Part of: Set up the corner');
  await page.reload();
  await expect(child).toContainText('Part of: Set up the corner');
});
