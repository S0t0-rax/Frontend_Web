import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-blue-600 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/dashboard" class="text-white text-2xl font-bold">
              SERVMECA
            </a>
          </div>

          <!-- Menu Desktop -->
          <div class="hidden md:flex items-center space-x-4">
            <a
              routerLink="/dashboard"
              routerLinkActive="bg-blue-700"
              [routerLinkActiveOptions]="{ exact: true }"
              class="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              Dashboard
            </a>

            <a
              *ngIf="user() && user()!.roles.some(r => r.name === 'Admin')"
              routerLink="/admin"
              routerLinkActive="bg-blue-700"
              class="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              Panel Admin
            </a>

            <a
              *ngIf="user() && user()!.roles.some(r => r.name === 'Workshop')"
              routerLink="/workshop"
              routerLinkActive="bg-blue-700"
              class="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
            >
              Mi Taller
            </a>

            <div class="relative group">
              <button class="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition flex items-center">
                {{ user()?.name }}
                <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </button>

              <!-- Dropdown -->
              <div class="hidden group-hover:block absolute right-0 w-48 bg-white rounded-lg shadow-xl z-10">
                <a
                  routerLink="/profile"
                  class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                >
                  Mi Perfil
                </a>
                <a
                  routerLink="/change-password"
                  class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Cambiar Contraseña
                </a>
                <button
                  (click)="logout()"
                  class="block w-full text-left px-4 py-2 text-red-700 hover:bg-gray-100 rounded-b-lg border-t"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile menu button -->
          <button
            (click)="mobileMenuOpen.set(!mobileMenuOpen())"
            class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <!-- Mobile menu -->
        <div *ngIf="mobileMenuOpen()" class="md:hidden pb-4">
          <a
            routerLink="/dashboard"
            class="block text-white px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
          >
            Dashboard
          </a>
          <a
            *ngIf="user() && user()!.roles.some(r => r.name === 'Admin')"
            routerLink="/admin"
            class="block text-white px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
          >
            Panel Admin
          </a>
          <button
            (click)="logout()"
            class="w-full text-left text-white px-3 py-2 rounded-md text-base font-medium hover:bg-red-600 mt-2"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  user = signal<User | null>(null);
  mobileMenuOpen = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user.set(user);
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
