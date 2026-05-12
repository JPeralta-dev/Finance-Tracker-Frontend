import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavItemComponent } from '../nav-item/nav-item.component';
import { MobileMenuItem } from './mobile-menu.types';

@Component({
  selector: 'ft-mobile-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, NavItemComponent],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss',
})
export class MobileMenuComponent {
  items = input.required<MobileMenuItem[]>();
  isOpen = input<boolean>(false);

  close = output<void>();

  onClose(): void {
    this.close.emit();
  }
}
