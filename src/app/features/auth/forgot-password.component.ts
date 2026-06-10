import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../shared/icons/icon-registry';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { UiButtonComponent } from '../../shared/ui/ui-button/ui-button.component';

type ForgotPasswordState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgIcon, TranslatePipe, UiButtonComponent],
  providers: [provideIcons(ICONS)],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  state = signal<ForgotPasswordState>('idle');
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get email() {
    return this.form.get('email')!;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.state.set('loading');
    this.error = '';

    this.authService
      .forgotPassword(this.email.value!)
      .pipe(
        finalize(() => {
          this.state.set('success');
        }),
      )
      .subscribe({
        next: () => {
          this.toast.success('If an account exists with this email, you will receive a reset link.');
        },
        error: () => {
          // Always show same message to prevent email enumeration
          this.toast.success('If an account exists with this email, you will receive a reset link.');
        },
      });
  }
}
