import 'reflect-metadata';
import { config } from 'dotenv';
config({ quiet: true });
const testUrl = process.env['TEST_DATABASE_URL'];
if (!testUrl) throw new Error('TEST_DATABASE_URL is required for isolated integration tests.');
const parsed = new URL(testUrl);
if (!parsed.pathname.endsWith('_test') || !['localhost', '127.0.0.1'].includes(parsed.hostname))
  throw new Error('Integration tests require a dedicated local database ending in _test.');
process.env['DATABASE_URL'] = testUrl;
process.env['DIRECT_URL'] = testUrl;
process.env['NODE_ENV'] = 'test';
process.env['VITEST'] = 'true';

process.env['UPLOAD_DIR'] = '.local/integration-uploads';
