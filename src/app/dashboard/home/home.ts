import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { ROLE_LABELS, ROLE_ICONS } from '../../core/models/auth.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  readonly roleLabels = ROLE_LABELS;
  readonly roleIcons = ROLE_ICONS;

  constructor(readonly authService: AuthService) {}

  get user() {
    return this.authService.currentUser();
  }

  get primaryRole(): string {
    return this.authService.primaryRole();
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
