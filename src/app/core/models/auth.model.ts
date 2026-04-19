/**
 * Modelos de Autenticación — mapean a los schemas del backend FastAPI.
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role_name?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  roles: string[];
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UserUpdate {
  full_name?: string;
  phone?: string;
}

/** Roles permitidos en el panel web */
export type AllowedRole = 'admin' | 'workshop_owner' | 'mechanic';

/** Mapeo de roles a etiquetas legibles */
export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  workshop_owner: 'Dueño de Taller',
  mechanic: 'Mecánico',
  client: 'Cliente',
};

/** Mapeo de roles a íconos */
export const ROLE_ICONS: Record<string, string> = {
  admin: '⚙️',
  workshop_owner: '🏭',
  mechanic: '🔧',
  client: '👤',
};
