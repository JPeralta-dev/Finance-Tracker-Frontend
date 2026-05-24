// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from "@angular/core";
import { provideRouter, withViewTransitions } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { HttpClient } from "@angular/common/http";

import { routes } from "./app.routes";
import { authInterceptor } from "./core/interceptors/auth.interceptor";
import { initializeTranslations } from "./core/i18n/translation.initializer";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: (http: HttpClient) => initializeTranslations(http),
      deps: [HttpClient],
      multi: true,
    },
  ],
};
