import { bootstrapApplication } from '@angular/platform-browser';
import { mergeApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { sharedConfig } from '../../../libs/config/src/app-providers';
import { App } from './app/app';
import { routes } from './app/app.routes';
bootstrapApplication(
  App,
  mergeApplicationConfig(sharedConfig, {
    providers: [provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' }))],
  }),
).catch((error) =>
  console.error(
    'Administration could not start.',
    error instanceof Error ? error.message : 'Unknown startup error',
  ),
);
