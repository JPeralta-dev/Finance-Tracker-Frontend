import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { filter, map, take, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Premium route guard — redirects free users to /subscription with ?upgrade=true.
 * Shows a warning toast explaining the feature requires a premium tier.
 */
export const premiumGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toast = inject(ToastService);

  // Trigger session check (idempotent)
  authService.initAuthCheck();

  return authService.authReady$.pipe(
    filter((ready) => ready),
    take(1),
    map(() => {
      if (authService.isPremium()) {
        return true;
      }

      // Free user — redirect to subscription page
      toast.warning(
        'Función premium',
        'Necesitás una suscripción premium para acceder a esta sección.',
      );

      const urlTree = router.parseUrl('/subscription');
      urlTree.queryParams = { upgrade: 'true' };
      router.navigate(['/subscription'], { queryParams: { upgrade: 'true' } });
      return false;
    }),
  );
};
