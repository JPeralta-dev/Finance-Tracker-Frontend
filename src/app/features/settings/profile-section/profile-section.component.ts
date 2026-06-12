import { Component, signal, inject, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-section',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, FtSubtleRevealDirective],
  templateUrl: './profile-section.component.html',
  styleUrl: './profile-section.component.scss',
})
export class ProfileSectionComponent implements OnInit {
  private readonly authService = inject(AuthService);

  delay = input<number>(0);
  displayName = signal('');
  email = signal('');

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.displayName.set(user.displayName ?? user.email);
          this.email.set(user.email);
        },
        error: () => {
          this.authService.clearTokens();
        },
      });
    }
  }
}
