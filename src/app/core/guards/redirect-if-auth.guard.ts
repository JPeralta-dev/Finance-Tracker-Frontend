import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";

export const redirectIfAuthGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const token = localStorage.getItem("accessToken");

  if (token !== null) {
    router.navigate(["/dashboard"]);
    return false;
  }

  return true;
};
