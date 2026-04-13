import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IncidentService } from '../../core/services/incident.service';
import { LoaderComponent } from '../../shared/components/loader.component';
import { Incident } from '../../core/models/incident.model';

@Component({
  selector: 'app-my-incidents',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8 flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Mis Incidentes</h1>
            <p class="text-gray-600 mt-2">Historial de todos tus reportes</p>
          </div>
          <a
            routerLink="/report-incident"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            + Nuevo Incidente
          </a>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-lg shadow p-4">
            <p class="text-gray-600 text-sm">Total</p>
            <p class="text-2xl font-bold text-gray-900">{{ incidents().length }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <p class="text-gray-600 text-sm">Pendientes</p>
            <p class="text-2xl font-bold text-yellow-600">{{ countByStatus('pending') }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <p class="text-gray-600 text-sm">Asignadas</p>
            <p class="text-2xl font-bold text-blue-600">{{ countByStatus('assigned') }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <p class="text-gray-600 text-sm">Completadas</p>
            <p class="text-2xl font-bold text-green-600">{{ countByStatus('completed') }}</p>
          </div>
        </div>

        <!-- Incidents List -->
        <div class="space-y-4">
          <div
            *ngFor="let incident of incidents()"
            class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="text-lg font-bold text-gray-900">#{{ incident.id }} - {{ incident.description }}</h3>
                <p class="text-gray-600 text-sm mt-1">📍 {{ incident.location }}</p>
              </div>
              <span
                [ngClass]="{
                  'bg-yellow-100 text-yellow-800': incident.status === 'pending',
                  'bg-blue-100 text-blue-800': incident.status === 'assigned',
                  'bg-green-100 text-green-800': incident.status === 'completed',
                  'bg-red-100 text-red-800': incident.status === 'cancelled'
                }"
                class="px-3 py-1 rounded-full text-xs font-semibold"
              >
                {{ getStatusLabel(incident.status) }}
              </span>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-600">
              <p>Reportado: {{ incident.reportedAt | date: 'dd/MM/yyyy HH:mm' }}</p>
              <a
                [routerLink]="['/incident', incident.id]"
                class="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Ver detalles →
              </a>
            </div>
          </div>

          <div *ngIf="incidents().length === 0" class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p class="text-gray-600 mb-4">No tienes incidentes reportados</p>
            <a
              routerLink="/report-incident"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Reportar uno ahora
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MyIncidentsComponent implements OnInit {
  incidents = signal<Incident[]>([]);
  loading = signal(true);

  constructor(private incidentService: IncidentService) {}

  ngOnInit(): void {
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.incidentService.getUserIncidents().subscribe({
      next: (incidents) => {
        this.incidents.set(incidents);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading incidents:', err);
        this.loading.set(false);
      }
    });
  }

  countByStatus(status: string): number {
    return this.incidents().filter(i => i.status === status).length;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Pendiente',
      assigned: 'Asignada',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  }
}
