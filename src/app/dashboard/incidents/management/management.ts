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
            <button class="btn-action view" (click)="selectedIncident.set(incident)">
              Ver Estado
            </button>
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

      <!-- Modal de Estado Detallado -->
      <div class="modal-overlay" *ngIf="selectedIncident()" (click)="selectedIncident.set(null)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <header class="modal-header">
            <h3>Estado Detallado - Ticket #{{ selectedIncident()?.id }}</h3>
            <button class="close-btn" (click)="selectedIncident.set(null)">&times;</button>
          </header>
          
          <div class="modal-body" *ngIf="selectedIncident() as inc">
            <div class="status-timeline">
              <div class="timeline-item" [class.active]="inc.reported_at">
                <span class="dot"></span>
                <div class="info">
                  <strong>Reportado</strong>
                  <span>{{ inc.reported_at | date:'medium' }}</span>
                </div>
              </div>
              
              <div class="timeline-item" [class.active]="inc.scheduled_at">
                <span class="dot"></span>
                <div class="info">
                  <strong>Salida del Taller</strong>
                  <span>{{ inc.scheduled_at ? (inc.scheduled_at | date:'medium') : 'Pendiente' }}</span>
                </div>
              </div>
              
              <div class="timeline-item" [class.active]="inc.started_at">
                <span class="dot"></span>
                <div class="info">
                  <strong>Llegada al Incidente</strong>
                  <span>{{ inc.started_at ? (inc.started_at | date:'medium') : 'Pendiente' }}</span>
                </div>
              </div>
              
              <div class="timeline-item" [class.active]="inc.finished_at">
                <span class="dot"></span>
                <div class="info">
                  <strong>Reparación Finalizada</strong>
                  <span>{{ inc.finished_at ? (inc.finished_at | date:'medium') : 'Pendiente' }}</span>
                </div>
              </div>
            </div>

            <div class="extra-info">
              <div class="info-group">
                <label>Mecánico Asignado</label>
                <p>{{ inc.mechanic_name || 'No asignado' }}</p>
              </div>
              <div class="info-group">
                <label>Estado del Viaje</label>
                <p class="status-pill" [ngClass]="inc.arrival_status">{{ inc.arrival_status || 'pending' | uppercase }}</p>
              </div>
            </div>
          </div>
        </div>
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

    /* Modal Styles */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-content {
      background: #1e293b; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px; width: 90%; max-width: 500px; padding: 24px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
    }
    .close-btn { background: none; border: none; color: white; font-size: 24px; cursor: pointer; }

    /* Timeline Styles */
    .status-timeline { margin-bottom: 24px; display: flex; flex-direction: column; gap: 16px; }
    .timeline-item { display: flex; gap: 16px; align-items: flex-start; opacity: 0.4; }
    .timeline-item.active { opacity: 1; }
    .dot { width: 12px; height: 12px; border-radius: 50%; background: #64748b; margin-top: 6px; position: relative; }
    .timeline-item.active .dot { background: var(--accent); box-shadow: 0 0 10px var(--accent); }
    .info { display: flex; flex-direction: column; }
    .info strong { font-size: 0.9rem; }
    .info span { font-size: 0.8rem; color: rgba(255,255,255,0.5); }

    .extra-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); }
    .info-group label { font-size: 0.75rem; color: rgba(255,255,255,0.5); text-transform: uppercase; }
    .status-pill { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; background: rgba(255,255,255,0.1); margin-top: 4px; }
    .on_the_way { color: #3b82f6; }
    .arrived { color: #10b981; }

    .btn-action.view { background: rgba(255,255,255,0.1); color: white; margin-bottom: 8px; }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class IncidentManagementComponent implements OnInit {
  private readonly incidentService = inject(IncidentService);

  activeIncidents = signal<Incident[]>([]);
  selectedIncident = signal<Incident | null>(null);
  loading = signal(false);

  ngOnInit() {
    this.loadMyIncidents();
  }

  loadMyIncidents() {
    this.loading.set(true);
    this.incidentService.getAssignedIncidents()
      .subscribe({
        next: (data) => {
          this.activeIncidents.set(data);
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
