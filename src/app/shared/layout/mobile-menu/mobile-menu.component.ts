import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { tap } from 'rxjs/operators';
import { NavItemComponent } from '../nav-item/nav-item.component';
import { MobileMenuItem } from './mobile-menu.types';
import { ICONS } from '../../../shared/icons/icon-registry';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'ft-mobile-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, NavItemComponent, NgIcon, TranslatePipe],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss',
})
export class MobileMenuComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  items = input.required<MobileMenuItem[]>();
  isOpen = input<boolean>(false);
  user = input<User | null>(null);

  close = output<void>();

  readonly currentUser = this.authService.currentUser;

  onClose(): void {
    this.close.emit();
  }

  onLogout(): void {
    this.authService.logout().pipe(
      tap(() => this.onClose())
    ).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
