import {
  HttpInterceptorFn,
  HttpErrorResponse,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

const ACCESS_TOKEN_KEY = "accessToken";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  const authReq =
    token !== null
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem("refreshToken");
        router.navigate(["/login"]);
      }
      return throwError(() => error);
    }),
  );
};
