import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Incident, Appointment } from '../models/incident.model';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  constructor(private apiService: ApiService) {}

  reportIncident(data: {
    carId?: number;
    photo?: string;
    description: string;
    location: string;
  }): Observable<Incident> {
    return this.apiService.post<Incident>('/incidents', data);
  }

  getIncidentById(id: number): Observable<Incident> {
    return this.apiService.get<Incident>(`/incidents/${id}`);
  }

  getUserIncidents(): Observable<Incident[]> {
    return this.apiService.get<Incident[]>('/incidents/my-incidents');
  }

  getAllIncidents(): Observable<Incident[]> {
    return this.apiService.get<Incident[]>('/incidents');
  }

  updateIncidentStatus(id: number, status: string): Observable<Incident> {
    return this.apiService.patch<Incident>(`/incidents/${id}`, { status });
  }

  createAppointment(data: {
    incidentId: number;
    serviceId: number;
    mechanicId: number;
    appointmentDate: Date;
  }): Observable<Appointment> {
    return this.apiService.post<Appointment>('/appointments', data);
  }

  getAppointmentById(id: number): Observable<Appointment> {
    return this.apiService.get<Appointment>(`/appointments/${id}`);
  }

  getUserAppointments(): Observable<Appointment[]> {
    return this.apiService.get<Appointment[]>('/appointments/my-appointments');
  }

  getMechanicAppointments(): Observable<Appointment[]> {
    return this.apiService.get<Appointment[]>('/appointments/mechanic-appointments');
  }

  getAllAppointments(): Observable<Appointment[]> {
    return this.apiService.get<Appointment[]>('/appointments');
  }

  updateAppointmentStatus(id: number, status: string): Observable<Appointment> {
    return this.apiService.patch<Appointment>(`/appointments/${id}`, { status });
  }

  updateAppointmentArrivalStatus(id: number, arrivalStatus: string): Observable<Appointment> {
    return this.apiService.patch<Appointment>(`/appointments/${id}`, { arrivalStatus });
  }

  updateAppointmentServiceStatus(id: number, serviceStatus: string): Observable<Appointment> {
    return this.apiService.patch<Appointment>(`/appointments/${id}`, { serviceStatus });
  }

  cancelAppointment(id: number): Observable<Appointment> {
    return this.apiService.patch<Appointment>(`/appointments/${id}`, { status: 'cancelled' });
  }

  getIncidentHistory(): Observable<any[]> {
    return this.apiService.get('/incidents/history');
  }

  getFrequentProblems(): Observable<any[]> {
    return this.apiService.get('/analytics/frequent-problems');
  }

  getModelsWithMostIssues(): Observable<any[]> {
    return this.apiService.get('/analytics/models-with-issues');
  }

  getLocationsWithMostIncidents(): Observable<any[]> {
    return this.apiService.get('/analytics/locations-with-incidents');
  }
}
