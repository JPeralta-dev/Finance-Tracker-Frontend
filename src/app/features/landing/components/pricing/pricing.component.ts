import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { TierCard } from '../../../../core/models/tier.model';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

/**
 * Pricing — three-tier responsive card grid (Free / Premium / Premium Plus).
 *
 * The data is supplied via the [tiers] input so the same model can be
 * reused by the marketing landing and the authenticated subscription page.
 */
@Component({
  selector: 'ft-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon, FtSubtleRevealDirective, TranslatePipe],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {
  /** Tier data — kept as an input so the parent can decide source. */
  readonly tiers = input.required<TierCard[]>();

  /** Whether the section is shown in compact/embedded mode. */
  readonly compact = input<boolean>(false);
}
