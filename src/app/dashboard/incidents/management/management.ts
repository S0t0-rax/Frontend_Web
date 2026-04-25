import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentService } from '../../../core/services/incident.service';
import { Incident, IncidentStatus } from '../../../core/models/incident.model';
import { IncidentCardComponent } from '../../../shared/components/incident-card/incident-card';

@Component({
  selector: 'app-incident-management',
  standalone: true,
  imports: [CommonModule, IncidentCardComponent],
  template: `
    <div class="view-container">
      <header class="view-header">
        <div>
          <h1>Gestión de Asistencia</h1>
          <p class="subtitle">Administra las solicitudes que has aceptado y actualiza su progreso.</p>
        </div>
      </header>

      <div *ngIf="loading()" class="loader">
        <div class="spinner"></div>
        <span>Cargando tus asistencias...</span>
      </div>

      <div *ngIf="!loading() && activeIncidents().length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <h3>No tienes asistencias activas</h3>
        <p>Ve a "Solicitudes Disponibles" para aceptar una nueva tarea.</p>
      </div>

      <div class="incidents-grid" *ngIf="!loading() && activeIncidents().length > 0">
        <app-incident-card *ngFor="let incident of activeIncidents()" [incident]="incident">
          <div class="management-actions">
            <button *ngIf="incident.status === 'assigned'" class="btn-action start" (click)="updateStatus(incident.id, 'in_progress')">
              Iniciar Reparación
            </button>
            <button *ngIf="incident.status === 'in_progress'" class="btn-action done" (click)="updateStatus(incident.id, 'resolved')">
              Finalizar Trabajo
            </button>
            <button class="btn-action cancel" (click)="updateStatus(incident.id, 'rejected')">
              Cancelar
            </button>
          </div>
        </app-incident-card>
      </div>
    </div>
  `,
  styles: [`
    .view-container { padding: 24px; animation: fadeIn 0.5s ease; }
    .view-header { margin-bottom: 24px; }
    .subtitle { color: rgba(255, 255, 255, 0.6); margin-top: 4px; }

    .incidents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .management-actions {
      display: flex; flex-direction: column; gap: 8px; width: 100%;
    }

    .btn-action {
      padding: 10px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .start { background: #f59e0b; color: black; }
    .done { background: #10b981; color: white; }
    .cancel { background: rgba(255, 255, 255, 0.05); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
    .btn-action:hover { opacity: 0.9; transform: scale(1.02); }

    .loader, .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 80px 0; color: rgba(255, 255, 255, 0.5); gap: 16px;
    }
    .spinner {
      width: 40px; height: 40px; border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class IncidentManagementComponent implements OnInit {
  private readonly incidentService = inject(IncidentService);

  activeIncidents = signal<Incident[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadMyIncidents();
  }

  loadMyIncidents() {
    this.loading.set(true);
    // Para propósitos de este MVP/Dashboard, buscamos todos los incidentes 
    // y filtramos localmente aquellos que están en estados de gestión.
    this.incidentService.getNearbyIncidents(-16.5, -68.15, 100000)
      .subscribe({
        next: (data) => {
          const managed = data.filter(i => i.status === 'assigned' || i.status === 'in_progress');
          this.activeIncidents.set(managed);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  updateStatus(id: number, status: IncidentStatus) {
    const msg = status === 'resolved' ? '¿Confirmas que el trabajo ha sido finalizado?' : '¿Confirmas el cambio de estado?';
    if (!confirm(msg)) return;

    this.incidentService.updateIncident(id, { status })
      .subscribe({
        next: () => {
          alert('Estado actualizado correctamente.');
          this.loadMyIncidents();
        },
        error: (err) => alert('Error: ' + (err.error?.detail || 'Error desconocido'))
      });
  }
}
