export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  roles: Role[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  roleId: number;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
