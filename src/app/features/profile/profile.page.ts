import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { catchError, of } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models/user.model';

type ProfileState = 'loading' | 'ready' | 'error';

@Component({
  selector: 'ft-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly user = signal<User | null>(null);
  readonly state = signal<ProfileState>('loading');

  readonly profileForm = new FormGroup({
    displayName: new FormControl(''),
    email: new FormControl({ value: '', disabled: true }),
  });

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.state.set('loading');

    this.authService.getProfile()
      .pipe(catchError(() => {
        this.state.set('error');
        this.toast.error('Failed to load profile data.');
        return of(null);
      }))
      .subscribe({
        next: (user) => {
          if (user) {
            this.user.set(user);
            this.profileForm.patchValue({
              displayName: user.displayName ?? '',
              email: user.email,
            });
            this.state.set('ready');
          }
        },
      });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const displayName = this.profileForm.get('displayName')?.value;
    if (!displayName) return;

    this.authService.updateProfile(displayName).subscribe({
      next: () => {
        this.toast.success('Profile updated successfully!');
      },
      error: () => {
        this.toast.error('Failed to save profile. Please try again.');
      },
    });
  }
}
