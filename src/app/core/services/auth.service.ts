import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap } from "rxjs";

import { environment } from "../../../environments/environment";
import { AuthResponse, RefreshResponse, User } from "../models/user.model";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = `${environment.apiUrl}/api/auth`;

  login(
    email: string,
    password: string,
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/login`, { email, password })
      .pipe(tap((res) => this.setTokens(res.accessToken, res.refreshToken)));
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
      .pipe(tap((res) => this.setTokens(res.accessToken, res.refreshToken)));
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<void>(`${this.base}/logout`, { refreshToken })
      .pipe(
        tap({
          next: () => this.clearTokens(),
          error: () => this.clearTokens(),
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

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
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
    this.router.navigate(["/login"]);
  }

  private getRefreshToken(): string {
    return localStorage.getItem(REFRESH_TOKEN_KEY) ?? "";
  }
}
