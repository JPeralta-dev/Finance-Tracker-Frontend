import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../shared/icons/icon-registry';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { UiButtonComponent } from '../../shared/ui/ui-button/ui-button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgIcon, TranslatePipe, UiButtonComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);

  loading = false;
  error = '';
  showPassword = false;
  readonly strengthLevels = [0, 1, 2, 3];

  readonly strengthScore = computed(() => {
    const pwd = this.password.value || '';
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  });

  readonly strengthLabel = computed(() => {
    const score = this.strengthScore();
    if (score === 0) return '';
    const keys = ['auth.passwordStrength.weak', 'auth.passwordStrength.fair', 'auth.passwordStrength.good', 'auth.passwordStrength.strong'];
    return this.i18n.translate(keys[score - 1]);
  });

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    displayName: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  get email() {
    return this.form.get('email')!;
  }

  get displayName() {
    return this.form.get('displayName')!;
  }

  get password() {
    return this.form.get('password')!;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    const displayName = this.displayName.value?.trim() || undefined;

    this.authService
      .register(this.email.value!, this.password.value!, displayName)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.error =
            err.status === 409
              ? 'auth.errors.email_exists'
              : 'auth.errors.generic';
        },
      });
  }

  onGoogleSignIn(): void {
    this.authService.signInWithGoogle();
  }
}
