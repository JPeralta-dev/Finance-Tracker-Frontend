import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpClient,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import {
  catchError,
  throwError,
  BehaviorSubject,
  filter,
  take,
  switchMap,
} from "rxjs";
import { AuthService } from "../services/auth.service";
import { environment } from "../../../environments/environment";

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<boolean | null>(null);

/** Reset module-level state — for testing only */
export function resetInterceptorState(): void {
  isRefreshing = false;
  refreshTokenSubject.next(null);
}

/**
 * Auth interceptor for cookie-based sessions.
 *
 * Phase 3: No longer injects Bearer tokens — cookies are sent
 * automatically by the browser. Keeps 401 retry logic for session expiry.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const http = inject(HttpClient);

  // Ensure cookies are sent with cross-origin requests
  const authReq = req.clone({ withCredentials: true });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;

        return http
          .post<void>(
            `${environment.apiUrl}/api/auth/session/refresh`,
            {},
            { withCredentials: true },
          )
          .pipe(
            switchMap(() => {
              isRefreshing = false;
              refreshTokenSubject.next(true);
              // Retry the original request with refreshed session
              return next(req.clone({ withCredentials: true }));
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              refreshTokenSubject.next(null);

              // Session refresh failed — user needs to re-login
              authService.clearSession();
              router.navigate(["/login"]);
              return throwError(() => refreshError);
            }),
          );
      } else if (error.status === 401 && isRefreshing) {
        return refreshTokenSubject.pipe(
          filter((result) => result !== null),
          take(1),
          switchMap(() => {
            // Retry the original request after session refresh
            return next(req.clone({ withCredentials: true }));
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
