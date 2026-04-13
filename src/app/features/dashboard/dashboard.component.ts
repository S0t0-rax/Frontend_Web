import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IncidentService } from '../../core/services/incident.service';
import { UserService } from '../../core/services/user.service';
import { LoaderComponent } from '../../shared/components/loader.component';
import { Incident, Appointment } from '../../core/models/incident.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Bienvenido, {{ userName() }}!</h1>
          <p class="text-gray-600 mt-2">Gestiona tus incidentes y citas de reparación</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-3 bg-blue-100 rounded-full">
                <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-gray-600 text-sm">Total Incidentes</p>
                <p class="text-2xl font-bold text-gray-900">{{ incidents().length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-3 bg-yellow-100 rounded-full">
                <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h12a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-gray-600 text-sm">Citas Programadas</p>
                <p class="text-2xl font-bold text-gray-900">{{ appointments().length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-3 bg-green-100 rounded-full">
                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-gray-600 text-sm">Completadas</p>
                <p class="text-2xl font-bold text-gray-900">{{ completedIncidents() }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-3 bg-red-100 rounded-full">
                <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-gray-600 text-sm">Pendientes</p>
                <p class="text-2xl font-bold text-gray-900">{{ pendingIncidents() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              routerLink="/report-incident"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center transition"
            >
              📝 Reportar Incidente
            </a>
            <a
              routerLink="/my-incidents"
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-center transition"
            >
              📋 Mis Incidentes
            </a>
            <a
              routerLink="/my-appointments"
              class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-center transition"
            >
              📅 Mis Citas
            </a>
          </div>
        </div>

        <!-- Recent Incidents -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 border-b">
            <h2 class="text-lg font-bold text-gray-900">Incidentes Recientes</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Descripción</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ubicación</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fecha</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr *ngFor="let incident of incidents() | slice:0:5" class="hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm text-gray-900">{{ incident.description }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ incident.location }}</td>
                  <td class="px-6 py-4">
                    <span
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': incident.status === 'pending',
                        'bg-blue-100 text-blue-800': incident.status === 'assigned',
                        'bg-green-100 text-green-800': incident.status === 'completed',
                        'bg-red-100 text-red-800': incident.status === 'cancelled'
                      }"
                      class="px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      {{ incident.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ incident.reportedAt | date: 'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <a
                      [routerLink]="['/incident', incident.id]"
                      class="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Ver
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  userName = signal('Usuario');
  incidents = signal<Incident[]>([]);
  appointments = signal<Appointment[]>([]);
  loading = signal(true);

  constructor(
    private incidentService: IncidentService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => this.userName.set(user.name),
      error: (err) => console.error('Error loading user:', err)
    });

    this.incidentService.getUserIncidents().subscribe({
      next: (incidents) => this.incidents.set(incidents),
      error: (err) => console.error('Error loading incidents:', err),
      complete: () => this.loading.set(false)
    });

    this.incidentService.getUserAppointments().subscribe({
      next: (appointments) => this.appointments.set(appointments),
      error: (err) => console.error('Error loading appointments:', err)
    });
  }

  completedIncidents(): number {
    return this.incidents().filter(i => i.status === 'completed').length;
  }

  pendingIncidents(): number {
    return this.incidents().filter(i => i.status === 'pending').length;
  }
}
