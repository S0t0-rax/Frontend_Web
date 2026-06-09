import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tenant, TenantRegistrationRequest, TenantUpdate } from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = `${environment.apiUrl}/tenants`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista completa de Tenants (Solo SuperAdmin)
   */
  getTenants(skip: number = 0, limit: number = 50): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(this.apiUrl, {
      params: { skip: skip.toString(), limit: limit.toString() }
    });
  }

  /**
   * Obtiene los detalles de un Tenant (Solo SuperAdmin)
   */
  getTenant(id: number): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.apiUrl}/${id}`);
  }

  /**
   * Registra un nuevo Tenant y su administrador
   */
  registerTenant(data: TenantRegistrationRequest): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.apiUrl}/register`, data);
  }

  /**
   * Actualiza los datos de un Tenant, útil para suspenderlo (is_active: false)
   */
  updateTenant(id: number, data: TenantUpdate): Observable<Tenant> {
    return this.http.patch<Tenant>(`${this.apiUrl}/${id}`, data);
  }
}
