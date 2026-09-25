import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

interface ResourceCard {
  readonly icon: string;
  readonly titleKey: string;
  readonly descriptionKey: string;
}

@Component({
  selector: 'ft-resources-section',
  standalone: true,
  imports: [NgIcon, TranslatePipe],
  templateUrl: './resources-section.component.html',
  styleUrl: './resources-section.component.scss',
})
export class ResourcesSectionComponent {
  readonly resources: readonly ResourceCard[] = [
    {
      icon: 'book',
      titleKey: 'landing.resources.blog.title',
      descriptionKey: 'landing.resources.blog.description',
    },
    {
      icon: 'documentText',
      titleKey: 'landing.resources.guides.title',
      descriptionKey: 'landing.resources.guides.description',
    },
    {
      icon: 'chart',
      titleKey: 'landing.resources.calculators.title',
      descriptionKey: 'landing.resources.calculators.description',
    },
  ];
}
