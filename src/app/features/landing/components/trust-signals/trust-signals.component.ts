import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { TrustBadge } from '../../../../core/models/tier.model';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

/**
 * Trust Signals — security & privacy badges.
 *
 * Glass-morphism style consistent with the rest of the landing. On
 * desktop, badges line up in a single row; on mobile they wrap to a
 * 2-column grid.
 */
@Component({
  selector: 'ft-trust-signals',
  standalone: true,
  imports: [CommonModule, NgIcon, FtSubtleRevealDirective, TranslatePipe],
  templateUrl: './trust-signals.component.html',
  styleUrl: './trust-signals.component.scss',
})
export class TrustSignalsComponent {
  /** Trust badges to display (icon + i18n label key). */
  readonly badges = input.required<TrustBadge[]>();
}
