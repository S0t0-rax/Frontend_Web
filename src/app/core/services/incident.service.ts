import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Incident, IncidentUpdate, IncidentStatus } from '../models/incident.model';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/incidents`;

  /**
   * Obtener incidentes cercanos (para staff)
   */
  getNearbyIncidents(lat: number, lng: number, radiusMeters: number = 5000): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}/nearby`, {
      params: {
        latitude: lat.toString(),
        longitude: lng.toString(),
        radius_meters: radiusMeters.toString()
      }
    });
  }

  /**
   * Obtener detalle de un incidente específico
   */
  getIncidentById(id: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualizar estado o descripción de un incidente
   */
  updateIncident(id: number, data: IncidentUpdate): Observable<Incident> {
    return this.http.patch<Incident>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Lista de incidentes propios (si el backend lo permite) o filtrados por estado
   * NOTA: Actualmente el endpoint de "/" lista solo los del cliente authenticado en el backend v1.
   * Usaremos Nearby o lista global si existe.
   */
  /**
   * Obtener incidentes asignados a los talleres del dueño actual
   */
  getAssignedIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}/assigned`);
  }

  /**
   * Obtener incidentes asignados al mecánico actual
   */
  getMechanicTasks(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.apiUrl}/mechanic/tasks`);
  }

  /**
   * Actualizar estado de llegada de una orden de servicio
   */
  updateServiceOrder(orderId: number, data: any): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/api/v1/service-orders/${orderId}`, data);
  }
}
