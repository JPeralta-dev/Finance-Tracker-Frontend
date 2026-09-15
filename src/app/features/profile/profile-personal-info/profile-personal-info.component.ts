import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';

@Component({
  selector: 'app-profile-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIcon, TranslatePipe, FtSubtleRevealDirective],
  templateUrl: './profile-personal-info.component.html',
  styleUrl: './profile-personal-info.component.scss',
})
export class ProfilePersonalInfoComponent {
  profileForm = input.required<FormGroup>();
  delay = input<number>(0);

  /** Visual-only toggle: lock hides the password, check reveals it. */
  showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit(): void {
    // Delegate to parent via form submit event
  }
}
