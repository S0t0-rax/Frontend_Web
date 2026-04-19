/**
 * AuthService — Gestión de autenticación, tokens JWT y estado del usuario.
 * Compatible con SSR (no usa localStorage directamente en el servidor).
 */
import { Injectable, computed, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, switchMap, catchError, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  TokenResponse,
  UserCreate,
  UserResponse,
  ChangePasswordRequest,
  UserUpdate,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/auth`;
  private readonly allowedRoles = environment.allowedRoles;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Estado reactivo del usuario actual */
  readonly currentUser = signal<UserResponse | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser() && !!this.getAccessToken());
  readonly userRoles = computed(() => this.currentUser()?.roles ?? []);
  readonly primaryRole = computed(() => {
    const roles = this.userRoles();
    // Prioridad: admin > workshop_owner > mechanic
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('workshop_owner')) return 'workshop_owner';
    if (roles.includes('mechanic')) return 'mechanic';
    return roles[0] ?? '';
  });

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {
    // Intentar restaurar sesión al iniciar (solo en browser)
    if (this.isBrowser) {
      this.tryRestoreSession();
    }
  }

  // ── Login ──────────────────────────────────────────────────────
  login(credentials: LoginRequest): Observable<UserResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((tokens) => this.storeTokens(tokens)),
      switchMap(() => this.fetchMe()),
      tap((user) => {
        if (!this.hasAllowedRole(user)) {
          this.logout();
          throw new Error('ACCESS_DENIED_ROLE');
        }
        this.currentUser.set(user);
      }),
    );
  }

  // ── Register ───────────────────────────────────────────────────
  register(data: UserCreate): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/register`, data);
  }

  // ── Logout ─────────────────────────────────────────────────────
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // ── Cambiar Contraseña ─────────────────────────────────────────
  changePassword(data: ChangePasswordRequest): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/change-password`, data);
  }

  // ── Actualizar Perfil ──────────────────────────────────────────
  updateProfile(data: UserUpdate): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/me`, data).pipe(
      tap((user) => this.currentUser.set(user))
    );
  }

  // ── Refresh Token ──────────────────────────────────────────────
  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<TokenResponse>(`${this.apiUrl}/refresh`, { refresh_token: refreshToken })
      .pipe(tap((tokens) => this.storeTokens(tokens)));
  }

  // ── Obtener perfil ─────────────────────────────────────────────
  fetchMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/me`);
  }

  // ── Token helpers ──────────────────────────────────────────────
  getAccessToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('refresh_token');
  }

  private storeTokens(tokens: TokenResponse): void {
    if (!this.isBrowser) return;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }

  private hasAllowedRole(user: UserResponse): boolean {
    return user.roles.some((role) => this.allowedRoles.includes(role));
  }

  private tryRestoreSession(): void {
    const token = this.getAccessToken();
    if (!token) return;

    this.fetchMe()
      .pipe(
        catchError(() => {
          this.logout();
          return of(null);
        }),
      )
      .subscribe((user) => {
        if (user && this.hasAllowedRole(user)) {
          this.currentUser.set(user);
        } else if (user) {
          this.logout();
        }
      });
  }
}
