import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCheck, heroLockClosed, heroSparkles, heroChevronRight } from '@ng-icons/heroicons/outline';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'ft-final-cta',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent, FtSubtleRevealDirective, TranslatePipe],
  providers: [provideIcons({ heroCheck, heroLockClosed, heroSparkles, heroChevronRight })],
  templateUrl: './final-cta.component.html',
  styleUrl: './final-cta.component.scss',
})
export class FinalCtaComponent {}
