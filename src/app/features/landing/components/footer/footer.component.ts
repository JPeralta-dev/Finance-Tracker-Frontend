import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'ft-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly contactEmail = 'support@flowr.finance';
  readonly telegramBotUrl = environment.telegramBotUrl;
}
