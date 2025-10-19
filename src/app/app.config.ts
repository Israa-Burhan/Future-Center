import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { publicRoutes } from './modules/public/public.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { ConfirmationService, MessageService } from 'primeng/api';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';

registerLocaleData(localeAr);
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      [...routes, ...publicRoutes, ...adminRoutes],
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      })
    ),
    provideClientHydration(),
    importProvidersFrom(BrowserAnimationsModule),
    MessageService,
    ConfirmationService,
  ],
};
