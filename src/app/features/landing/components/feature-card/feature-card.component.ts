import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';

@Component({
  selector: 'ft-feature-card',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons(ICONS)],
  templateUrl: './feature-card.component.html',
  styleUrl: './feature-card.component.scss',
})
export class FeatureCardComponent {
  icon = input.required<string>();
  title = input.required<string>();
  description = input.required<string>();
}
