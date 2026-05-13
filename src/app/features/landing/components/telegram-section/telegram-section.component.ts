import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';

@Component({
  selector: 'ft-telegram-section',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons(ICONS)],
  templateUrl: './telegram-section.component.html',
  styleUrl: './telegram-section.component.scss',
})
export class TelegramSectionComponent {}
