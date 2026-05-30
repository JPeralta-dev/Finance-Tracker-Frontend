import { Injectable, inject, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap } from "rxjs";
import { toObservable } from "@angular/core/rxjs-interop";

import { environment } from "../../../environments/environment";
import { AuthResponse, RefreshResponse, User } from "../models/user.model";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = `${environment.apiUrl}/api/auth`;

  // Signal privado como fuente de verdad
  private readonly _userSignal = signal<User | null>(null);

  // Signal público computed para isAuthenticated
  readonly isAuthenticated = computed(() => this._userSignal() !== null);

  // Signal público para el usuario actual
  readonly currentUser = this._userSignal.asReadonly();

  // Observable para backward compatibility
  readonly user$: Observable<User | null> = toObservable(this._userSignal);

  constructor() {
    // Inicializar desde localStorage al boot
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = this.getAccessToken();
    if (token) {
      // Si hay token, fetchear el perfil
      this.getProfile().subscribe({
        next: (user) => this._userSignal.set(user),
        error: () => this._userSignal.set(null),
      });
    }
  }

  login(
    email: string,
    password: string,
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/login`, { email, password })
      .pipe(
        tap((res) => {
          this.setTokens(res.accessToken, res.refreshToken);
          this._userSignal.set(res.user);
        }),
      );
  }

  register(
    email: string,
    password: string,
    displayName?: string,
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/register`, {
        email,
        password,
        displayName,
      })
      .pipe(
        tap((res) => {
          this.setTokens(res.accessToken, res.refreshToken);
          this._userSignal.set(res.user);
        }),
      );
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<void>(`${this.base}/logout`, { refreshToken })
      .pipe(
        tap({
          next: () => {
            this.clearTokens();
            this._userSignal.set(null);
          },
          error: () => {
            this.clearTokens();
            this._userSignal.set(null);
          },
        }),
      );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.base}/me`);
  }

  refreshToken(): Observable<RefreshResponse> {
    const token = this.getRefreshToken();
    return this.http
      .post<RefreshResponse>(`${this.base}/refresh`, { refreshToken: token })
      .pipe(tap((res) => this.setAccessToken(res.accessToken)));
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  setAccessToken(accessToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // Navigation moved to caller sites
  }

  updateProfile(displayName: string): Observable<User> {
    return this.http.put<User>(`${this.base}/profile`, { displayName }).pipe(
      tap((user) => this._userSignal.set(user)),
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.base}/forgot-password`, { email });
  }

  private getRefreshToken(): string {
    return localStorage.getItem(REFRESH_TOKEN_KEY) ?? "";
  }
}
