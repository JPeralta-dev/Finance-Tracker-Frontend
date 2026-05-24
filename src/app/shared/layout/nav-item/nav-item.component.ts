import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';

@Component({
  selector: 'ft-nav-item',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIcon],
  providers: [provideIcons(ICONS)],
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss',
})
export class NavItemComponent {
  label = input.required<string>();
  path = input.required<string>();
  /** Icon name from the registry (e.g. 'heroOutlineHome') */
  icon = input.required<string>();

  /** Compact mode for mobile menu */
  compact = input<boolean>(false);
}
