import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../models/auth.model';
import { UserAdminUpdate, AuditLogResponse, IncidentGlobalResponse } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // --- Users CRUD ---
  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/api/v1/users`);
  }

  updateUser(id: number, data: UserAdminUpdate): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/api/v1/users/${id}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/v1/users/${id}`);
  }

  // --- Audit Log ---
  getAuditLogs(): Observable<AuditLogResponse[]> {
    return this.http.get<AuditLogResponse[]>(`${this.apiUrl}/api/v1/audit`);
  }

  getGlobalIncidents(): Observable<IncidentGlobalResponse[]> {
    return this.http.get<IncidentGlobalResponse[]>(`${this.apiUrl}/api/v1/incidents/global`);
  }
}
