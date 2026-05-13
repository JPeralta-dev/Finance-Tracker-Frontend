import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';

@Component({
  selector: 'ft-public-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon],
  providers: [provideIcons(ICONS)],
  templateUrl: './public-navbar.component.html',
  styleUrl: './public-navbar.component.scss',
})
export class PublicNavbarComponent {}
