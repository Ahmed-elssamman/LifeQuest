import { sessionInterceptor } from '../../auth/src/session-interceptor';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { MessageService, ConfirmationService } from 'primeng/api';
import type { ComponentsDesignTokens } from '@primeuix/themes/types';
import base from '@primeuix/themes/aura/base';
import button from '@primeuix/themes/aura/button';
import dialog from '@primeuix/themes/aura/dialog';
import confirmdialog from '@primeuix/themes/aura/confirmdialog';
import toast from '@primeuix/themes/aura/toast';
import drawer from '@primeuix/themes/aura/drawer';
const Aura = {
  ...base,
  components: {
    button,
    dialog,
    confirmdialog,
    toast,
    drawer,
  },
};
import { definePreset } from '@primeuix/themes';
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
export const sharedConfig = (components: ComponentsDesignTokens = {}): ApplicationConfig => ({
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([sessionInterceptor])),
    providePrimeNG({
      theme: {
        preset: definePreset(LifeQuest, { components }),
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
});
