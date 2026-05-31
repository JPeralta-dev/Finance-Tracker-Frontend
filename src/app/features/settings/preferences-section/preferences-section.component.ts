import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';

@Component({
  selector: 'app-preferences-section',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, FtSubtleRevealDirective],
  providers: [provideIcons(ICONS)],
  templateUrl: './preferences-section.component.html',
  styleUrl: './preferences-section.component.scss',
})
export class PreferencesSectionComponent {
  delay = input<number>(0);
}
