// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter, withViewTransitions } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideIcons } from "@ng-icons/core";

import { routes } from "./app.routes";
import { authInterceptor } from "./core/interceptors/auth.interceptor";
import { ICONS } from "./shared/icons/icon-registry";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideIcons(ICONS),
  ],
};
