import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentService } from '../../../core/services/incident.service';
import { Incident } from '../../../core/models/incident.model';
import { IncidentCardComponent } from '../../../shared/components/incident-card/incident-card.ts';

@Component({
  selector: 'app-available-incidents',
  standalone: true,
  imports: [CommonModule, IncidentCardComponent],
  template: `
    <div class="view-container">
      <header class="view-header">
        <div>
          <h1>Solicitudes Disponibles</h1>
          <p class="subtitle">Incidentes reportados cerca de tu ubicación que esperan ser atendidos.</p>
        </div>
        <button (click)="loadIncidents()" class="btn-refresh" [disabled]="loading()">
          <svg [class.spinning]="loading()" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
          Actualizar
        </button>
      </header>

      <div class="status-filters">
        <div class="radius-toggle">
          <span>Radio: </span>
          <select #radius (change)="onRadiusChange(radius.value)">
            <option value="5000">5 km</option>
            <option value="10000">10 km</option>
            <option value="20000">20 km</option>
            <option value="50000">50 km</option>
          </select>
        </div>
      </div>

      <div *ngIf="loading()" class="loader">
        <div class="spinner"></div>
        <span>Buscando solicitudes...</span>
      </div>

      <div *ngIf="!loading() && incidents().length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
        <h3>No hay solicitudes abiertas</h3>
        <p>Vuelve a intentarlo en unos minutos o aumenta el radio de búsqueda.</p>
      </div>

      <div class="incidents-grid" *ngIf="!loading() && incidents().length > 0">
        <app-incident-card *ngFor="let incident of incidents()" [incident]="incident">
          <button class="btn-primary full-width" (click)="acceptIncident(incident.id)">
            Aceptar Solicitud
          </button>
        </app-incident-card>
      </div>
    </div>
  `,
  styles: [`
    .view-container { padding: 24px; animation: fadeIn 0.5s ease; }
    .view-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .subtitle { color: rgba(255, 255, 255, 0.6); margin-top: 4px; }
    
    .btn-refresh {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 16px; background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px;
      color: white; cursor: pointer; transition: all 0.2s;
    }
    .btn-refresh:hover:not(:disabled) { background: rgba(255, 255, 255, 0.1); }
    .spinning { animation: spin 1s linear infinite; }

    .status-filters { margin-bottom: 24px; display: flex; gap: 16px; }
    .radius-toggle select {
      background: #1a1a1a; color: white; border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 4px 8px; border-radius: 4px;
    }

    .incidents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .btn-primary {
      background: var(--accent); color: #000; border: none;
      padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; }
    .full-width { width: 100%; }

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
export class AvailableIncidentsComponent implements OnInit {
  private readonly incidentService = inject(IncidentService);
  
  incidents = signal<Incident[]>([]);
  loading = signal(false);
  currentRadius = 5000;

  ngOnInit() {
    this.loadIncidents();
  }

  loadIncidents() {
    this.loading.set(true);
    // Coordenadas base (ej. Centro de La Paz) mientras implementamos geolocalización real
    const lat = -16.5000;
    const lng = -68.1500;

    this.incidentService.getNearbyIncidents(lat, lng, this.currentRadius)
      .subscribe({
        next: (data) => {
          this.incidents.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  onRadiusChange(value: string) {
    this.currentRadius = parseInt(value);
    this.loadIncidents();
  }

  acceptIncident(id: number) {
    if (!confirm('¿Estás seguro de que quieres aceptar esta solicitud de asistencia?')) return;

    this.incidentService.updateIncident(id, { status: 'accepted' })
      .subscribe({
        next: () => {
          alert('Solicitud aceptada. Ahora puedes gestionarla en "Mis Asistencias".');
          this.loadIncidents();
        },
        error: (err) => alert('Error al aceptar solicitud: ' + (err.error?.detail || 'Error desconocido'))
      });
  }
}
