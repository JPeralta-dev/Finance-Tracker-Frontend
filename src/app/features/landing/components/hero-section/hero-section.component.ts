import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { HeroVisualComponent } from '../hero-visual/hero-visual.component';

@Component({
  selector: 'ft-hero-section',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon, HeroVisualComponent],
  providers: [provideIcons(ICONS)],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent {}
