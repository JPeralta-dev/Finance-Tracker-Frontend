import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { filter, map, take } from "rxjs";
import { AuthService } from "../services/auth.service";

export const redirectIfAuthGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Wait for session check to complete before deciding
  return authService.authReady$.pipe(
    filter((ready) => ready),
    take(1),
    map(() => {
      if (authService.isAuthenticated()) {
        router.navigate(["/dashboard"]);
        return false;
      }
      return true;
    }),
  );
};
