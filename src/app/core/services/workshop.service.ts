import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Workshop, CreateWorkshopRequest, UpdateWorkshopRequest } from '../models/workshop.model';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class WorkshopService {
  constructor(private apiService: ApiService) {}

  getAllWorkshops(): Observable<Workshop[]> {
    return this.apiService.get<Workshop[]>('/workshops');
  }

  getWorkshopById(id: number): Observable<Workshop> {
    return this.apiService.get<Workshop>(`/workshops/${id}`);
  }

  createWorkshop(data: CreateWorkshopRequest): Observable<Workshop> {
    return this.apiService.post<Workshop>('/workshops', data);
  }

  updateWorkshop(id: number, data: UpdateWorkshopRequest): Observable<Workshop> {
    return this.apiService.put<Workshop>(`/workshops/${id}`, data);
  }

  deleteWorkshop(id: number): Observable<any> {
    return this.apiService.delete(`/workshops/${id}`);
  }

  getWorkshopServices(workshopId: number): Observable<any[]> {
    return this.apiService.get(`/workshops/${workshopId}/services`);
  }

  addServiceToWorkshop(workshopId: number, serviceId: number, price: number, duration: string): Observable<any> {
    return this.apiService.post(`/workshops/${workshopId}/services`, {
      serviceId,
      price,
      estimatedDuration: duration
    });
  }

  removeServiceFromWorkshop(workshopId: number, serviceId: number): Observable<any> {
    return this.apiService.delete(`/workshops/${workshopId}/services/${serviceId}`);
  }

  getAllServices(): Observable<Service[]> {
    return this.apiService.get<Service[]>('/services');
  }

  getWorkshopNearby(latitude: number, longitude: number, radiusKm: number): Observable<Workshop[]> {
    return this.apiService.get<Workshop[]>('/workshops/nearby', {
      lat: latitude,
      lng: longitude,
      radius: radiusKm
    });
  }

  getCurrentWorkshop(): Observable<Workshop> {
    return this.apiService.get<Workshop>('/workshops/me');
  }
}
