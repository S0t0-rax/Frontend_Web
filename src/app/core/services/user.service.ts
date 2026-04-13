import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, ChangePasswordRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  getCurrentUser(): Observable<User> {
    return this.apiService.get<User>('/users/me');
  }

  updateUserProfile(data: Partial<User>): Observable<User> {
    return this.apiService.put<User>('/users/me', data);
  }

  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.apiService.post('/users/change-password', data);
  }

  getUserById(id: number): Observable<User> {
    return this.apiService.get<User>(`/users/${id}`);
  }

  getAllUsers(): Observable<User[]> {
    return this.apiService.get<User[]>('/users');
  }

  getAllMechanics(): Observable<User[]> {
    return this.apiService.get<User[]>('/users?role=mechanic');
  }
}
