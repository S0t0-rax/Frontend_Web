import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, AuthResponse, LoginRequest, RegisterRequest, ChangePasswordRequest } from '../models/user.model';
import { ApiService } from './api.service';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error loading stored user', e);
        this.clearStorage();
      }
    }
  }

  private getUserFromStorage(): User | null {
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch (e) {
      return null;
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      this.apiService.post<AuthResponse>('/auth/login', credentials).subscribe(
        (response: AuthResponse) => {
          this.setAuthData(response.token, response.user);
          observer.next(response);
          observer.complete();
        },
        (error: any) => observer.error(error)
      );
    });
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      this.apiService.post<AuthResponse>('/auth/register', data).subscribe(
        (response: AuthResponse) => {
          this.setAuthData(response.token, response.user);
          observer.next(response);
          observer.complete();
        },
        (error: any) => observer.error(error)
      );
    });
  }

  registerWorkshop(data: any): Observable<AuthResponse> {
    return new Observable(observer => {
      this.apiService.post<AuthResponse>('/auth/register-workshop', data).subscribe(
        (response: AuthResponse) => {
          this.setAuthData(response.token, response.user);
          observer.next(response);
          observer.complete();
        },
        (error: any) => observer.error(error)
      );
    });
  }

  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.apiService.post('/auth/change-password', data);
  }

  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private setAuthData(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearStorage(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.roles) return false;
    return user.roles.some(role => role.name.toLowerCase() === roleName.toLowerCase());
  }

  hasPermission(permissionName: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.roles) return false;
    return user.roles.some(role =>
      role.permissions.some(perm => perm.name.toLowerCase() === permissionName.toLowerCase())
    );
  }
}
