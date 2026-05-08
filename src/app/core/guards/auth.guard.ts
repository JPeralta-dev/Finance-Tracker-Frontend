import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";

export const authGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const token = localStorage.getItem("accessToken");

  if (token === null) {
    router.navigate(["/login"]);
    return false;
  }

  return true;
};
