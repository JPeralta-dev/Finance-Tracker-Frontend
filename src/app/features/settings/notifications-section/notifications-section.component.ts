import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';

@Component({
  selector: 'app-notifications-section',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, FtSubtleRevealDirective],
  templateUrl: './notifications-section.component.html',
  styleUrl: './notifications-section.component.scss',
})
export class NotificationsSectionComponent {
  delay = input<number>(0);
}
