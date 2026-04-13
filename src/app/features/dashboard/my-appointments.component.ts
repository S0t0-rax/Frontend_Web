import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IncidentService } from '../../core/services/incident.service';
import { LoaderComponent } from '../../shared/components/loader.component';
import { Appointment } from '../../core/models/incident.model';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Mis Citas de Reparación</h1>
          <p class="text-gray-600 mt-2">Gestiona tus citas programadas</p>
        </div>

        <!-- Tabs -->
        <div class="flex space-x-4 mb-8 border-b border-gray-200">
          <button
            (click)="filterStatus.set('all')"
            [ngClass]="{
              'border-b-2 border-blue-600 text-blue-600': filterStatus() === 'all',
              'text-gray-600': filterStatus() !== 'all'
            }"
            class="pb-4 font-semibold transition"
          >
            Todas ({{ appointments().length }})
          </button>
          <button
            (click)="filterStatus.set('scheduled')"
            [ngClass]="{
              'border-b-2 border-blue-600 text-blue-600': filterStatus() === 'scheduled',
              'text-gray-600': filterStatus() !== 'scheduled'
            }"
            class="pb-4 font-semibold transition"
          >
            Programadas
          </button>
          <button
            (click)="filterStatus.set('completed')"
            [ngClass]="{
              'border-b-2 border-blue-600 text-blue-600': filterStatus() === 'completed',
              'text-gray-600': filterStatus() !== 'completed'
            }"
            class="pb-4 font-semibold transition"
          >
            Completadas
          </button>
        </div>

        <!-- Appointments List -->
        <div class="space-y-4">
          <div
            *ngFor="let appointment of getFilteredAppointments()"
            class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 class="text-lg font-bold text-gray-900">Cita #{{ appointment.id }}</h3>
                <p class="text-gray-600">Servicio: {{ appointment.service?.name }}</p>
              </div>
              <div class="text-right">
                <span
                  [ngClass]="{
                    'bg-blue-100 text-blue-800': appointment.status === 'scheduled',
                    'bg-green-100 text-green-800': appointment.status === 'completed',
                    'bg-red-100 text-red-800': appointment.status === 'cancelled'
                  }"
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {{ appointment.status }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <p class="font-semibold text-gray-900">Fecha</p>
                <p>{{ appointment.appointmentDate | date: 'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <div>
                <p class="font-semibold text-gray-900">Llegada Estimada</p>
                <p>{{ appointment.estimatedArrivalTime || 'Por confirmar' }}</p>
              </div>
              <div>
                <p class="font-semibold text-gray-900">Estado de Servicio</p>
                <p>{{ appointment.serviceStatus }}</p>
              </div>
            </div>

            <div class="flex gap-2 pt-4 border-t">
              <button
                *ngIf="appointment.status === 'scheduled'"
                (click)="cancelAppointment(appointment.id)"
                class="text-red-600 hover:text-red-800 font-semibold text-sm"
              >
                Cancelar
              </button>
              <a
                [routerLink]="['/appointment', appointment.id]"
                class="text-blue-600 hover:text-blue-800 font-semibold text-sm"
              >
                Ver detalles →
              </a>
            </div>
          </div>

          <div *ngIf="getFilteredAppointments().length === 0" class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p class="text-gray-600">No hay citas en esta categoría</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MyAppointmentsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  filterStatus = signal<'all' | 'scheduled' | 'completed'>('all');
  loading = signal(true);

  constructor(private incidentService: IncidentService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.incidentService.getUserAppointments().subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        this.loading.set(false);
      }
    });
  }

  getFilteredAppointments(): Appointment[] {
    const filter = this.filterStatus();
    if (filter === 'all') return this.appointments();
    return this.appointments().filter(a => a.status === filter);
  }

  cancelAppointment(id: number): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      this.incidentService.cancelAppointment(id).subscribe({
        next: () => this.loadAppointments(),
        error: (err) => console.error('Error canceling appointment:', err)
      });
    }
  }
}
