import { config } from 'dotenv';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

config({ quiet: true });
if (process.env['VERCEL_API_ORIGIN'])
  throw new Error(
    'Split Render deployment uses Vercel as a static frontend. Do not run this legacy API configuration script.',
  );
for (const key of ['DATABASE_URL', 'VERCEL_WEB_ORIGIN', 'VERCEL_ADMIN_ORIGIN'])
  if (!process.env[key]) throw new Error(`Missing ${key}`);
if (!process.env['CRON_SECRET']) {
  process.env['CRON_SECRET'] = randomBytes(32).toString('base64url');
  appendFileSync('.env', `\nCRON_SECRET=${process.env['CRON_SECRET']}\n`, { mode: 0o600 });
}
const values = {
  DATABASE_URL: process.env['DATABASE_URL'],
  NODE_ENV: 'production',
  WEB_ORIGIN: process.env['VERCEL_WEB_ORIGIN'],
  ADMIN_ORIGIN: process.env['VERCEL_ADMIN_ORIGIN'],
  APP_URL: process.env['VERCEL_WEB_ORIGIN'],
  MAIL_MODE: 'disabled',
  CRON_SECRET: process.env['CRON_SECRET'],
};
for (const [name, value] of Object.entries(values)) {
  const secret = ['DATABASE_URL', 'CRON_SECRET'].includes(name);
  const result = spawnSync(
    'vercel',
    [
      'env',
      'add',
      name,
      'production',
      '--force',
      '--yes',
      secret ? '--sensitive' : '--no-sensitive',
      '--cwd',
      '.local/vercel/web',
    ],
    { input: value, encoding: 'utf8' },
  );
  if (result.status !== 0)
    throw new Error(`Could not configure ${name}; CLI output withheld to protect secrets.`);
  console.log(`Configured ${name}.`);
}
