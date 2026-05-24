import {
  HttpInterceptorFn,
  HttpErrorResponse,
} from "@angular/common/http";
import { inject } from "@angular/core";
import {
  catchError,
  throwError,
  BehaviorSubject,
  filter,
  take,
  switchMap,
} from "rxjs";
import { AuthService } from "../services/auth.service";

const ACCESS_TOKEN_KEY = "accessToken";

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

/** Reset module-level state — for testing only */
export function resetInterceptorState(): void {
  isRefreshing = false;
  refreshTokenSubject.next(null);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  const authReq =
    token !== null
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;

        return authService.refreshToken().pipe(
          switchMap((refreshResponse) => {
            isRefreshing = false;
            refreshTokenSubject.next(refreshResponse);

            const newToken = refreshResponse.accessToken;
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            refreshTokenSubject.next(null);

            authService.clearTokens();
            return throwError(() => refreshError);
          }),
        );
      } else if (error.status === 401 && isRefreshing) {
        return refreshTokenSubject.pipe(
          filter((token) => token !== null),
          take(1),
          switchMap(() => {
            const newToken = localStorage.getItem(ACCESS_TOKEN_KEY);
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}`! },
            });
            return next(retryReq);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
