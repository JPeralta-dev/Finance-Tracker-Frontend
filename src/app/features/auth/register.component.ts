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
          @if (error) {
            <div class="error-banner">{{ error }}</div>
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
            [class.btn-primary--disabled]="form.invalid || loading"
            [disabled]="form.invalid || loading"
          >
            @if (loading) {
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
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      background: var(--bg-primary);
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      background: var(--surface);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 40px 32px;
    }
    .auth-title {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 4px;
    }
    .auth-subtitle {
      color: var(--text-secondary);
      margin: 0 0 32px;
      font-size: 15px;
    }
    .auth-form { display: flex; flex-direction: column; gap: 20px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .field label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .field input {
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: 15px;
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.03);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      caret-color: var(--accent-start);
    }
    .field input::placeholder { color: var(--text-tertiary); }
    .field input:focus {
      border-color: var(--accent-start);
      box-shadow: 0 0 0 3px rgba(6, 214, 160, 0.15);
    }
    .field input:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 30px rgba(10, 14, 23, 1) inset !important;
      -webkit-text-fill-color: var(--text-primary) !important;
    }
    .field-error { font-size: 12px; color: var(--error); }
    .error-banner {
      background: rgba(255, 107, 107, 0.1);
      border: 1px solid rgba(255, 107, 107, 0.2);
      color: var(--error);
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 500;
    }
    .btn-primary {
      padding: 14px;
      background: linear-gradient(135deg, var(--accent-start), var(--accent-mid));
      color: var(--text-inverse);
      border: none;
      border-radius: var(--radius-sm);
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover:not(.btn-primary--disabled) {
      box-shadow: 0 4px 16px rgba(6, 214, 160, 0.3);
      transform: translateY(-1px);
    }
    .btn-primary--disabled {
      opacity: 0.4;
      cursor: not-allowed;
      filter: grayscale(0.5);
    }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      color: var(--text-secondary);
      font-size: 14px;
    }
    .auth-footer a { color: var(--info); font-weight: 600; text-decoration: none; }
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
