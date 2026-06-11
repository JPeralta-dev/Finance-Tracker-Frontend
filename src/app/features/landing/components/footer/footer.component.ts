import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';

@Component({
  selector: 'ft-footer',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons(ICONS)],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly contactEmail = 'support@flowr.finance';
}
