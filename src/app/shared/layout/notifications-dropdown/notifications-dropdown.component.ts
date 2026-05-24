import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'ft-notifications-dropdown',
  standalone: true,
  imports: [CommonModule, NgIcon, ClickOutsideDirective],
  providers: [provideIcons(ICONS)],
  templateUrl: './notifications-dropdown.component.html',
  styleUrl: './notifications-dropdown.component.scss',
})
export class NotificationsDropdownComponent {
  readonly isOpen = signal<boolean>(false);

  toggleDropdown(): void {
    this.isOpen.update((open) => !open);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  onMenuClick(event: Event): void {
    event.stopPropagation();
  }
}
