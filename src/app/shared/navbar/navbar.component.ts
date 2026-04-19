import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ROLE_LABELS, ROLE_ICONS } from '../../core/models/auth.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  showLogoutConfirm = signal(false);
  mobileMenuOpen = signal(false);

  readonly roleLabels = ROLE_LABELS;
  readonly roleIcons = ROLE_ICONS;

  constructor(
    readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  get userName(): string {
    return this.authService.currentUser()?.full_name ?? '';
  }

  get userRole(): string {
    return this.authService.primaryRole();
  }

  get roleLabel(): string {
    return this.roleLabels[this.userRole] ?? this.userRole;
  }

  get roleIcon(): string {
    return this.roleIcons[this.userRole] ?? '👤';
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  openLogoutConfirm(): void {
    this.showLogoutConfirm.set(true);
    this.mobileMenuOpen.set(false);
  }

  cancelLogout(): void {
    this.showLogoutConfirm.set(false);
  }

  confirmLogout(): void {
    this.showLogoutConfirm.set(false);
    this.authService.logout();
  }
}
