import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const app = express();
const browser = resolve(dirname(fileURLToPath(import.meta.url)), '../browser');
const angularApp = new AngularNodeAppEngine({
  allowedHosts: (process.env['SSR_ALLOWED_HOSTS'] ?? 'localhost,127.0.0.1').split(','),
});
app.disable('x-powered-by');
app.use((_request, response, next) => {
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
app.use(
  express.static(browser, {
    index: false,
    redirect: false,
    setHeaders(response, path) {
      // Only content-hashed bundles are immutable. HTML, the worker and its
      // manifest must revalidate so returning visitors can receive updates.
      if (/-[A-Z0-9]{8}\.(?:js|css)$/i.test(path))
        response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  }),
);
app.use((request, response, next) => {
  angularApp
    .handle(request)
    .then((result) => (result ? writeResponseToNodeResponse(result, response) : next()))
    .catch(next);
});
if (isMainModule(import.meta.url)) app.listen(process.env['WEB_PORT'] ?? 4000);
export const reqHandler = createNodeRequestHandler(app);
