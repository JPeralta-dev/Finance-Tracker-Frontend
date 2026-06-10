import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../shared/icons/icon-registry';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { UiButtonComponent } from '../../shared/ui/ui-button/ui-button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgIcon, TranslatePipe, UiButtonComponent],
  providers: [provideIcons(ICONS)],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  error = '';
  showPassword = false;

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
