import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';
import type { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile-avatar-card',
  standalone: true,
  imports: [CommonModule, NgIcon],
  templateUrl: './profile-avatar-card.component.html',
  styleUrl: './profile-avatar-card.component.scss',
})
export class ProfileAvatarCardComponent {
  user = input.required<User | null>();
  initials = input.required<string>();
}
