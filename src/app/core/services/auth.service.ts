import { Injectable, inject, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap, catchError, of, switchMap } from "rxjs";
import { toObservable } from "@angular/core/rxjs-interop";

import { environment } from "../../../environments/environment";
import { User } from "../models/user.model";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = `${environment.apiUrl}/api/auth`;

  // Signal privado como fuente de verdad
  private readonly _userSignal = signal<User | null>(null);

  // Señal de inicialización: true cuando terminó checkSession()
  readonly authReady = signal(false);

  // Observable que emite cuando authReady pasa a true
  readonly authReady$ = toObservable(this.authReady);

  // Signal público computed para isAuthenticated
  readonly isAuthenticated = computed(() => this._userSignal() !== null);

  // Signal público para el usuario actual
  readonly currentUser = this._userSignal.asReadonly();

  // Observable para backward compatibility
  readonly user$: Observable<User | null> = toObservable(this._userSignal);

  constructor() {
    // Defer session check to avoid circular DI — the interceptor injects AuthService
    setTimeout(() => this.checkSession(), 0);
  }

  /**
   * Check if there's an active Better Auth session via cookie.
   * Called on app boot to restore auth state.
   */
  private checkSession(): void {
    this.http
      .get<{
        user: { id: string; email: string; name?: string; image?: string };
        session: { id: string; expiresAt: string };
      }>(`${this.base}/get-session`, { withCredentials: true })
      .pipe(
        catchError(() => of(null)),
      )
      .subscribe({
        next: (response) => {
          if (response?.user) {
            this._userSignal.set({
              id: response.user.id,
              email: response.user.email,
              displayName: response.user.name,
              createdAt: new Date().toISOString(),
            });
          } else {
            this._userSignal.set(null);
          }
          this.authReady.set(true);
        },
        error: () => {
          this._userSignal.set(null);
          this.authReady.set(true);
        },
      });
  }

  login(
    email: string,
    password: string,
  ): Observable<User> {
    return this.http
      .post<{
        user: { id: string; email: string; name?: string };
        session: { id: string; expiresAt: string };
      }>(`${this.base}/sign-in/email`, { email, password }, { withCredentials: true })
      .pipe(
        tap((res) => {
          this._userSignal.set({
            id: res.user.id,
            email: res.user.email,
            displayName: res.user.name,
            createdAt: new Date().toISOString(),
          });
        }),
        switchMap((res) => of({
          id: res.user.id,
          email: res.user.email,
          displayName: res.user.name,
          createdAt: new Date().toISOString(),
        })),
      );
  }

  register(
    email: string,
    password: string,
    displayName?: string,
  ): Observable<User> {
    return this.http
      .post<{
        user: { id: string; email: string; name?: string };
        session: { id: string; expiresAt: string };
      }>(`${this.base}/sign-up/email`, {
        email,
        password,
        name: displayName,
      }, { withCredentials: true })
      .pipe(
        tap((res) => {
          this._userSignal.set({
            id: res.user.id,
            email: res.user.email,
            displayName: res.user.name,
            createdAt: new Date().toISOString(),
          });
        }),
        switchMap((res) => of({
          id: res.user.id,
          email: res.user.email,
          displayName: res.user.name,
          createdAt: new Date().toISOString(),
        })),
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.base}/sign-out`, {}, { withCredentials: true })
      .pipe(
        tap({
          next: () => {
            this._userSignal.set(null);
            this.router.navigate(["/login"]);
          },
          error: () => {
            // Even if server logout fails, clear local state
            this._userSignal.set(null);
            this.router.navigate(["/login"]);
          },
        }),
      );
  }

  /** Redirect to Google OAuth sign-in */
  signInWithGoogle(): void {
    const callbackURL = `${window.location.origin}/dashboard`;

    this.http
      .post<{ url: string; redirect: boolean }>(
        `${this.base}/sign-in/social`,
        { provider: 'google', callbackURL },
        { withCredentials: true },
      )
      .subscribe({
        next: (response) => {
          if (response.url) {
            window.location.href = response.url;
          }
        },
        error: (err) => {
          console.error('Google sign-in failed', err);
        },
      });
  }

  clearSession(): void {
    this._userSignal.set(null);
  }

  /** Alias for clearTokens — backward compatibility */
  clearTokens(): void {
    this.clearSession();
  }

  /**
   * Fetch user profile from Better Auth session.
   * Backward-compatible with old API — now uses session state.
   */
  getProfile(): Observable<User> {
    return new Observable<User>((observer) => {
      const current = this._userSignal();
      if (current) {
        observer.next(current);
        observer.complete();
      } else {
        // If no local state, try to refresh from session
        this.http
          .get<{
            user: { id: string; email: string; name?: string; image?: string };
            session: { id: string; expiresAt: string };
          }>(`${this.base}/get-session`, { withCredentials: true })
          .pipe(
            catchError(() => of(null)),
          )
          .subscribe({
            next: (response) => {
              if (response?.user) {
                const user: User = {
                  id: response.user.id,
                  email: response.user.email,
                  displayName: response.user.name,
                  createdAt: new Date().toISOString(),
                };
                this._userSignal.set(user);
                observer.next(user);
              } else {
                observer.error(new Error("No active session"));
              }
              observer.complete();
            },
          });
      }
    });
  }

  updateProfile(displayName: string): Observable<User> {
    // Better Auth doesn't have a direct profile update endpoint yet
    // This would need a custom endpoint or use the Better Auth API
    const current = this._userSignal();
    if (!current) {
      throw new Error("No user logged in");
    }
    const updated = { ...current, displayName };
    this._userSignal.set(updated);
    return new Observable<User>((observer) => {
      observer.next(updated);
      observer.complete();
    });
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.base}/forget-password`, { email });
  }
}
