import { sessionInterceptor } from '../../auth/src/session-interceptor';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MessageService, ConfirmationService } from 'primeng/api';
import base from '@primeng/themes/aura/base';
import button from '@primeng/themes/aura/button';
import dialog from '@primeng/themes/aura/dialog';
import confirmdialog from '@primeng/themes/aura/confirmdialog';
import toast from '@primeng/themes/aura/toast';
import drawer from '@primeng/themes/aura/drawer';
import datatable from '@primeng/themes/aura/datatable';
import paginator from '@primeng/themes/aura/paginator';
import select from '@primeng/themes/aura/select';
import tooltip from '@primeng/themes/aura/tooltip';
const Aura = {
  ...base,
  components: {
    button,
    dialog,
    confirmdialog,
    toast,
    drawer,
    datatable,
    paginator,
    select,
    tooltip,
  },
};
import { definePreset } from '@primeng/themes';
const LifeQuest = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{violet.50}',
      100: '{violet.100}',
      200: '{violet.200}',
      300: '{violet.300}',
      400: '{violet.400}',
      500: '#6b57cd',
      600: '#5b47bd',
      700: '#4d399f',
      800: '{violet.800}',
      900: '{violet.900}',
      950: '{violet.950}',
    },
  },
});
export const sharedConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([sessionInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: LifeQuest,
        options: {
          darkModeSelector: '.dark',
          cssLayer: { name: 'primeng', order: 'theme, base, primeng, components, utilities' },
        },
      },
      ripple: false,
    }),
    MessageService,
    ConfirmationService,
  ],
};
