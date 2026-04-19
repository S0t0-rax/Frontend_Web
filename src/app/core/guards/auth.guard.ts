/**
 * Guards de Autenticación — Protegen rutas según estado de sesión y rol.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * authGuard — Solo permite acceso a usuarios autenticados con rol permitido.
 * Redirige a /login si no cumple.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getAccessToken();
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.currentUser();
  if (user) {
    const hasRole = user.roles.some((r) => environment.allowedRoles.includes(r));
    if (!hasRole) {
      authService.logout();
      return false;
    }
  }

  return true;
};

/**
 * publicGuard — Solo permite acceso a usuarios NO autenticados.
 * Redirige a /dashboard si ya tiene sesión.
 */
export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getAccessToken() && authService.currentUser()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();
  
  if (!user || user.roles.indexOf('admin') === -1) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
