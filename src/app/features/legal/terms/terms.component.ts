import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'ft-terms',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon, TranslatePipe],
  templateUrl: './terms.component.html',
  styleUrl: '../legal.shared.scss',
})
export class TermsComponent {
  /** Last updated year — kept dynamic so the date is always current. */
  readonly updatedYear = new Date().getFullYear();
}
