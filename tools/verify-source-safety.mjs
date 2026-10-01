import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';
config({ quiet: true });
const secrets = [
  'DATABASE_URL',
  'DIRECT_URL',
  'SMTP_PASSWORD',
  'DEMO_PASSWORD',
  'DEMO_ADMIN_PASSWORD',
  'BLOB_READ_WRITE_TOKEN',
  'CRON_SECRET',
]
  .map((key) => process.env[key])
  .filter((value) => value && value.length > 10);
const roots = ['apps', 'libs', 'prisma', 'docs', '.github', 'tools', 'tests'];
const matches = [];
function visit(path) {
  if (statSync(path).isDirectory()) {
    for (const name of readdirSync(path)) visit(join(path, name));
    return;
  }
  if (!/\.(ts|js|mjs|json|md|html|css|sql|yml|yaml)$/.test(path)) return;
  const source = readFileSync(path, 'utf8');
  if (secrets.some((value) => source.includes(value))) matches.push(path);
}
for (const root of roots) visit(root);
visit('README.md');
if (matches.length) {
  console.error('Secret values detected in source files:', matches.join(', '));
  process.exitCode = 1;
} else
  console.log(
    'Source safety check passed; no configured secret values found in source or documentation.',
  );
