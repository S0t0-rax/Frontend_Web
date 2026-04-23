import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
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

  // Assign or update a mechanic's workshop
  assignMechanicWorkshop(id: number, workshop_id?: number): Observable<UserResponse> {
    const qs = workshop_id ? `?workshop_id=${workshop_id}` : '?workshop_id=';
    // New backend endpoint: PUT /api/v1/users/{id}/assign-workshop?workshop_id={id|null}
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}/assign-workshop${qs}`, {});
  }

  // Check if assign-workshop endpoint exists (OPTIONS)
  checkAssignEndpoint(): Observable<boolean> {
    // Use a harmless OPTIONS request to a representative URL
    const testUrl = `${this.apiUrl}/1/assign-workshop?workshop_id=`;
    return this.http.options(testUrl, { observe: 'response' }).pipe(
      map(resp => resp.status >= 200 && resp.status < 400),
      catchError(() => of(false))
    );
  }
}
