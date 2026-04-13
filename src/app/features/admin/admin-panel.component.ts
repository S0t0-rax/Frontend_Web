import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { IncidentService } from '../../core/services/incident.service';
import { LoaderComponent } from '../../shared/components/loader.component';
import { User } from '../../core/models/user.model';
import { Incident } from '../../core/models/incident.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Panel Administrativo</h1>
          <p class="text-gray-600 mt-2">Gestiona usuarios, talleres e incidentes del sistema</p>
        </div>

        <!-- Tabs -->
        <div class="flex space-x-4 mb-8 border-b border-gray-200">
          <button
            (click)="selectedTab.set('workshops')"
            [ngClass]="{
              'border-b-2 border-blue-600 text-blue-600': selectedTab() === 'workshops',
              'text-gray-600': selectedTab() !== 'workshops'
            }"
            class="pb-4 font-semibold transition"
          >
            Talleres Registrados
          </button>
          <button
            (click)="selectedTab.set('incidents')"
            [ngClass]="{
              'border-b-2 border-blue-600 text-blue-600': selectedTab() === 'incidents',
              'text-gray-600': selectedTab() !== 'incidents'
            }"
            class="pb-4 font-semibold transition"
          >
            Incidentes
          </button>
          <button
            (click)="selectedTab.set('users')"
            [ngClass]="{
              'border-b-2 border-blue-600 text-blue-600': selectedTab() === 'users',
              'text-gray-600': selectedTab() !== 'users'
            }"
            class="pb-4 font-semibold transition"
          >
            Usuarios
          </button>
        </div>

        <!-- Workshops Tab -->
        <div *ngIf="selectedTab() === 'workshops'" class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 border-b">
            <h2 class="text-lg font-bold text-gray-900">Talleres Mecánicos Registrados</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nombre</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Teléfono</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ubicación</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Capacidad</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Carga</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr *ngFor="let workshop of workshops()" class="hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm font-semibold text-gray-900">{{ workshop.name }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ workshop.email }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ workshop.phone }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ workshop.location }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ workshop.capacity }}</td>
                  <td class="px-6 py-4">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-blue-600 h-2 rounded-full"
                        [style.width.%]="(workshop.currentLoad / workshop.capacity) * 100"
                      ></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Incidents Tab -->
        <div *ngIf="selectedTab() === 'incidents'" class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 border-b">
            <h2 class="text-lg font-bold text-gray-900">Todos los Incidentes</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Descripción</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ubicación</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr *ngFor="let incident of incidents()" class="hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm text-gray-900 font-semibold">#{{ incident.id }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ incident.description }}</td>
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
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Users Tab -->
        <div *ngIf="selectedTab() === 'users'" class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 border-b">
            <h2 class="text-lg font-bold text-gray-900">Usuarios del Sistema</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nombre</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Teléfono</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Roles</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr *ngFor="let user of users()" class="hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm font-semibold text-gray-900">{{ user.name }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ user.email }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ user.phone }}</td>
                  <td class="px-6 py-4">
                    <div class="flex gap-2">
                      <span
                        *ngFor="let role of user.roles"
                        class="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full"
                      >
                        {{ role.name }}
                      </span>
                    </div>
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
export class AdminPanelComponent implements OnInit {
  selectedTab = signal<'workshops' | 'incidents' | 'users'>('workshops');
  workshops = signal<any[]>([]);
  incidents = signal<Incident[]>([]);
  users = signal<User[]>([]);
  loading = signal(true);

  constructor(
    private userService: UserService,
    private incidentService: IncidentService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => this.users.set(users),
      error: (err) => console.error('Error loading users:', err)
    });

    this.incidentService.getAllIncidents().subscribe({
      next: (incidents) => this.incidents.set(incidents),
      error: (err) => console.error('Error loading incidents:', err)
    });

    // Note: You'll need to add getAllWorkshops to WorkshopService
    // For now, we're leaving this as a placeholder
    this.loading.set(false);
  }
}
