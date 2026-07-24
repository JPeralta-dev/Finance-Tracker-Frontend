import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'ft-privacy',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon, TranslatePipe],
  templateUrl: './privacy.component.html',
  styleUrl: '../legal.shared.scss',
})
export class PrivacyComponent {
  readonly updatedYear = new Date().getFullYear();
}
