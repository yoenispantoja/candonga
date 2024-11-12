import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { LightboxModule } from 'ngx-lightbox';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(LightboxModule),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
  ],
};
