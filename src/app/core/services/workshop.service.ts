import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Workshop, WorkshopCreate, WorkshopUpdate } from '../models/workshop.model';

@Injectable({
  providedIn: 'root'
})
export class WorkshopService {
  private readonly apiUrl = `${environment.apiUrl}/workshops`;

  constructor(private readonly http: HttpClient) {}

  /** Lista todos los talleres */
  getWorkshops(skip = 0, limit = 50): Observable<Workshop[]> {
    return this.http.get<Workshop[]>(this.apiUrl, {
      params: { skip: skip.toString(), limit: limit.toString() }
    });
  }

  /** Obtiene detalle de un taller */
  getWorkshop(id: number): Observable<Workshop> {
    return this.http.get<Workshop>(`${this.apiUrl}/${id}`);
  }

  /** Crea un taller */
  createWorkshop(workshop: WorkshopCreate): Observable<Workshop> {
    return this.http.post<Workshop>(this.apiUrl, workshop);
  }

  /** Actualiza un taller */
  updateWorkshop(id: number, workshop: WorkshopUpdate): Observable<Workshop> {
    return this.http.patch<Workshop>(`${this.apiUrl}/${id}`, workshop);
  }

  /** Busca talleres cercanos */
  getNearbyWorkshops(lat: number, lng: number, radius = 10000): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/nearby`, {
      params: {
        latitude: lat.toString(),
        longitude: lng.toString(),
        radius_meters: radius.toString()
      }
    });
  }
}
