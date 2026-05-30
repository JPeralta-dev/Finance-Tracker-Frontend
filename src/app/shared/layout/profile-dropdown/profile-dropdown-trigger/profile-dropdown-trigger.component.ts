import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';

@Component({
  selector: 'app-profile-dropdown-trigger',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons(ICONS)],
  templateUrl: './profile-dropdown-trigger.component.html',
  styleUrl: './profile-dropdown-trigger.component.scss',
})
export class ProfileDropdownTriggerComponent {
  initials = input.required<string>();
  displayName = input.required<string>();
  isOpen = input.required<boolean>();

  toggled = output<void>();

  onToggle(): void {
    this.toggled.emit();
  }
}
