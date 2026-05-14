import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate/scroll-animate.directive';

@Component({
  selector: 'ft-telegram-section',
  standalone: true,
  imports: [CommonModule, NgIcon, ScrollAnimateDirective],
  providers: [provideIcons(ICONS)],
  templateUrl: './telegram-section.component.html',
  styleUrl: './telegram-section.component.scss',
})
export class TelegramSectionComponent {}
