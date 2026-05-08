import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";

import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="auth-title">Create account</h1>
        <p class="auth-subtitle">Start tracking your finances today</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          @if (error()) {
            <div class="error-banner">{{ error() }}</div>
          }

          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="you@example.com"
              autocomplete="email"
            />
            @if (email.invalid && email.touched) {
              <span class="field-error">Valid email is required</span>
            }
          </div>

          <div class="field">
            <label for="displayName">Display name (optional)</label>
            <input
              id="displayName"
              type="text"
              formControlName="displayName"
              placeholder="How should we call you?"
              maxlength="50"
            />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="At least 8 characters"
              autocomplete="new-password"
            />
            @if (password.invalid && password.touched) {
              <span class="field-error">Password must be at least 8 characters</span>
            }
          </div>

          <button
            type="submit"
            class="btn-primary"
            [disabled]="form.invalid || loading()"
          >
            @if (loading()) {
              <span class="spinner"></span> Creating account...
            } @else {
              Create account
            }
          </button>
        </form>

        <p class="auth-footer">
          Already have an account?
          <a routerLink="/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: calc(100vh - 60px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      background: white;
      border-radius: 16px;
      padding: 40px 32px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
    }
    .auth-title {
      font-size: 28px;
      font-weight: 700;
      color: #111;
      margin: 0 0 4px;
    }
    .auth-subtitle {
      color: #666;
      margin: 0 0 32px;
      font-size: 15px;
    }
    .auth-form { display: flex; flex-direction: column; gap: 20px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label {
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }
    .field input {
      padding: 12px 14px;
      border: 1px solid #ddd;
      border-radius: 10px;
      font-size: 15px;
      outline: none;
      transition: border-color 0.15s;
    }
    .field input:focus { border-color: #FF5C4D; }
    .field-error { font-size: 12px; color: #e53e3e; }
    .error-banner {
      background: #fff5f5;
      color: #c53030;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
    }
    .btn-primary {
      padding: 14px;
      background: #FF5C4D;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-primary:hover:not(:disabled) { background: #e54535; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      color: #666;
      font-size: 14px;
    }
    .auth-footer a { color: #FF5C4D; font-weight: 600; text-decoration: none; }
    .auth-footer a:hover { text-decoration: underline; }
    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin-right: 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  error = "";

  form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    displayName: [""],
    password: ["", [Validators.required, Validators.minLength(8)]],
  });

  get email() {
    return this.form.get("email")!;
  }

  get displayName() {
    return this.form.get("displayName")!;
  }

  get password() {
    return this.form.get("password")!;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = "";

    const displayName = this.displayName.value?.trim() || undefined;

    this.authService
      .register(this.email.value!, this.password.value!, displayName)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: () => this.router.navigate(["/dashboard"]),
        error: (err) => {
          this.error =
            err.status === 409
              ? "This email is already registered"
              : "Something went wrong. Try again.";
        },
      });
  }
}
