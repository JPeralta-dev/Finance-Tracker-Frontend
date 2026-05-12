import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'ft-nav-item',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss',
})
export class NavItemComponent {
  label = input.required<string>();
  path = input.required<string>();
  icon = input.required<string>();

  /** Compact mode for mobile menu */
  compact = input<boolean>(false);
}
