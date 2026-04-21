import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../models/auth.model';

export interface MechanicStaff {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  roles: string[];
  is_busy: boolean;
  workshop_id?: number;
  workshop_name?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/users`;

  constructor(private readonly http: HttpClient) {}

  // Owner creates a mechanic (owner must be authenticated)
  createMechanic(data: { email: string; password: string; full_name: string; phone?: string }, workshop_id?: number): Observable<UserResponse> {
    const qs = workshop_id ? `?workshop_id=${workshop_id}` : '';
    return this.http.post<UserResponse>(`${this.apiUrl}/mechanics${qs}`, { ...data });
  }

  // Get staff for current owner
  getMyStaff(): Observable<MechanicStaff[]> {
    return this.http.get<MechanicStaff[]>(`${this.apiUrl}/my-staff`);
  }
}
