import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

const socket = createServer();
await new Promise((resolve) => socket.listen(0, '127.0.0.1', resolve));
const port = socket.address().port;
await new Promise((resolve) => socket.close(resolve));
const server = spawn('node', ['dist/web/server/server.mjs'], {
  env: { ...process.env, WEB_PORT: String(port), SSR_ALLOWED_HOSTS: '127.0.0.1' },
  stdio: 'ignore',
});
const base = `http://127.0.0.1:${port}`;
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      ready = (await fetch(base, { signal: globalThis.AbortSignal.timeout(1000) })).ok;
      if (ready) break;
    } catch {
      /* Allow the production engine to start. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'Production SSR starts successfully');
  for (const path of ['/', '/help', '/index.csr.html', '/ngsw.json', '/ngsw-worker.js']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get('cache-control'), /no-cache/, path);
    assert.equal(response.headers.get('x-powered-by'), null);
    if (path === '/' || path === '/help') assert.match(await response.text(), /<h1\b/);
  }
  const html = await (await fetch(base)).text();
  const bundle = html.match(/src="(main-[^"]+\.js)"/)?.[1];
  assert.ok(bundle, 'The prerendered page loads a hashed client bundle');
  const asset = await fetch(`${base}/${bundle}`);
  assert.equal(asset.status, 200);
  assert.match(asset.headers.get('cache-control'), /max-age=31536000, immutable/);
  console.log('Public HTML rendering, update-sensitive caching and immutable bundles verified.');
} finally {
  server.kill('SIGTERM');
}
