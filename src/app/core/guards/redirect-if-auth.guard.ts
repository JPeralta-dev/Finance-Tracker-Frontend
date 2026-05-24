import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";

export const redirectIfAuthGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    router.navigate(["/dashboard"]);
    return false;
  }

  return true;
};
