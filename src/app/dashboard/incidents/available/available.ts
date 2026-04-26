import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentService } from '../../../core/services/incident.service';
import { Incident } from '../../../core/models/incident.model';
import { IncidentCardComponent } from '../../../shared/components/incident-card/incident-card';
import { WorkshopService } from '../../../core/services/workshop.service';
import { Workshop } from '../../../core/models/workshop.model';
import { AuthService } from '../../../core/services/auth.service';
import { UserService, MechanicStaff } from '../../../core/services/user.service';

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
            <option value="0">Cualquiera</option>
          </select>
        </div>
      </div>

      <div *ngIf="loading()" class="loader">
        <div class="spinner"></div>
        <span>Buscando solicitudes...</span>
      </div>

      <div *ngIf="!loading() && filteredIncidents().length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
        <h3>No hay solicitudes abiertas</h3>
        <p>Vuelve a intentarlo en unos minutos o aumenta el radio de búsqueda.</p>
      </div>

      <div class="incidents-grid" *ngIf="!loading() && filteredIncidents().length > 0">
        <app-incident-card *ngFor="let item of filteredIncidents()" [incident]="item.incident">
          <div class="nearest-info">
            <span class="workshop-name">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              Taller: {{ item.nearestWorkshop.name }}
            </span>
            <span class="distance-value">{{ (item.minDistance).toFixed(1) }} km de distancia</span>
          </div>
          <button class="btn-primary full-width" (click)="askConfirmation(item.incident, item.nearestWorkshop)">
            Aceptar Solicitud
          </button>
        </app-incident-card>
      </div>

      <!-- Modal de Confirmación Personalizado -->
      <div class="modal-overlay" *ngIf="isConfirming()">
        <div class="modal-content">
          <div class="modal-icon">🚨</div>
          <h3>Asignar Personal</h3>
          <p>Selecciona los mecánicos que atenderán este incidente:</p>
          
          <div class="mechanic-selector">
            <div *ngIf="availableMechanics().length === 0" class="no-mechanics">
              No hay mecánicos disponibles en este momento.
            </div>
            <div class="mechanic-item" *ngFor="let mech of availableMechanics()">
              <label class="checkbox-container">
                <input type="checkbox" (change)="toggleMechanic(mech.id)" [checked]="selectedMechanicIds().includes(mech.id)">
                <span class="checkmark"></span>
                <span class="mech-name">{{ mech.full_name }}</span>
              </label>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-secondary" (click)="cancelConfirmation()">Cancelar</button>
            <button class="btn-confirm" (click)="confirmAccept()" [disabled]="selectedMechanicIds().length === 0">
              Confirmar y Aceptar
            </button>
          </div>
        </div>
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

    .nearest-info {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      padding: 8px 12px; border-radius: 8px; margin-bottom: 12px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .workshop-name { color: #60a5fa; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 6px; }
    .distance-value { color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; }

    .btn-primary {
      background: #3b82f6; color: #fff; border: none;
      padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer;
      transition: all 0.2s; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4); }
    .full-width { width: 100%; }

    /* Modal Styles */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
      animation: fadeIn 0.3s ease;
    }
    .modal-content {
      background: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 32px; border-radius: 20px; max-width: 400px; width: 90%;
      text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }
    .modal-icon { font-size: 40px; margin-bottom: 16px; }
    .modal-actions { display: flex; gap: 12px; margin-top: 24px; }
    .btn-secondary {
      flex: 1; padding: 12px; background: rgba(255, 255, 255, 0.05); color: white;
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; cursor: pointer;
    }
    .btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

    .mechanic-selector {
      margin: 20px 0; max-height: 200px; overflow-y: auto;
      text-align: left; padding: 10px; background: rgba(255, 255, 255, 0.03);
      border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .mechanic-item { padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .mechanic-item:last-child { border-bottom: none; }
    .no-mechanics { color: #ef4444; font-size: 0.85rem; padding: 10px; text-align: center; }

    .checkbox-container {
      display: flex; align-items: center; gap: 12px; cursor: pointer; position: relative;
    }
    .checkbox-container input { display: none; }
    .checkmark {
      width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px; display: inline-block; position: relative;
    }
    .checkbox-container input:checked + .checkmark { background: #3b82f6; border-color: #3b82f6; }
    .checkbox-container input:checked + .checkmark:after {
      content: ""; position: absolute; left: 6px; top: 2px; width: 5px; height: 10px;
      border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg);
    }
    .mech-name { color: rgba(255, 255, 255, 0.9); font-size: 0.9rem; }

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
  private readonly workshopService = inject(WorkshopService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  
  allIncidents = signal<Incident[]>([]);
  myWorkshops = signal<Workshop[]>([]);
  filteredIncidents = signal<any[]>([]);
  loading = signal(false);
  isConfirming = signal(false);
  
  selectedIncident = signal<Incident | null>(null);
  selectedWorkshop = signal<Workshop | null>(null);
  availableMechanics = signal<any[]>([]);
  selectedMechanicIds = signal<number[]>([]);
  
  currentRadius = 5000;

  ngOnInit() {
    this.loadWorkshopsAndIncidents();
  }

  loadWorkshopsAndIncidents() {
    this.loading.set(true);
    // 1. Cargar talleres del dueño
    this.workshopService.getWorkshops().subscribe(workshops => {
      const myWs = workshops.filter(w => w.owner_id === this.authService.currentUser()?.id);
      this.myWorkshops.set(myWs);
      
      // 2. Cargar todos los incidentes abiertos (radius=0)
      this.loadIncidents();
    });
  }

  loadIncidents() {
    this.loading.set(true);
    // Usamos coordenadas por defecto pero con radio 0 para traer todos los abiertos
    this.incidentService.getNearbyIncidents(0, 0, 0)
      .subscribe({
        next: (data) => {
          this.allIncidents.set(data);
          this.processAndFilter();
          this.loading.set(false);
        },
        error: (err: any) => {
          console.error('Error cargando incidentes:', err);
          this.loading.set(false);
        }
      });
  }

  processAndFilter() {
    const workshops = this.myWorkshops();
    if (workshops.length === 0) {
      this.filteredIncidents.set([]);
      return;
    }

    const processed = this.allIncidents().map(incident => {
      // Encontrar el taller más cercano para este incidente
      let minDistance = Infinity;
      let nearestWorkshop = workshops[0];

      workshops.forEach(ws => {
        const dist = this.calculateDistance(incident.latitude, incident.longitude, ws.latitude, ws.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          nearestWorkshop = ws;
        }
      });

      return { incident, minDistance, nearestWorkshop };
    });

    // Filtrar por radio si no es "Cualquiera" (0)
    if (this.currentRadius > 0) {
      const radiusKm = this.currentRadius / 1000;
      this.filteredIncidents.set(processed.filter(item => item.minDistance <= radiusKm));
    } else {
      this.filteredIncidents.set(processed);
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  onRadiusChange(value: string) {
    this.currentRadius = parseInt(value);
    this.processAndFilter();
  }

  askConfirmation(incident: Incident, workshop: Workshop) {
    this.selectedIncident.set(incident);
    this.selectedWorkshop.set(workshop);
    this.selectedMechanicIds.set([]);
    
    // Cargar mecánicos disponibles
    this.loading.set(true);
    this.userService.getMyStaff().subscribe({
      next: (staff) => {
        // Filtramos por estado "available" o por el campo is_busy legado
        const available = staff.filter(m => (m as any).status === 'available' || !(m as any).is_busy);
        this.availableMechanics.set(available);
        this.isConfirming.set(true);
        this.loading.set(false);
      },
      error: () => {
        alert('Error al cargar personal disponible.');
        this.loading.set(false);
      }
    });
  }

  toggleMechanic(id: number) {
    const ids = this.selectedMechanicIds();
    if (ids.includes(id)) {
      this.selectedMechanicIds.set(ids.filter(i => i !== id));
    } else {
      this.selectedMechanicIds.set([...ids, id]);
    }
  }

  cancelConfirmation() {
    this.isConfirming.set(false);
    this.selectedIncident.set(null);
    this.selectedWorkshop.set(null);
  }

  confirmAccept() {
    const incident = this.selectedIncident();
    const workshop = this.selectedWorkshop();
    const mechanicIds = this.selectedMechanicIds();
    
    if (!incident || !workshop || mechanicIds.length === 0) return;

    this.isConfirming.set(false);
    this.loading.set(true);

    this.incidentService.updateIncident(incident.id, { 
      status: 'assigned',
      mechanic_ids: mechanicIds,
      workshop_id: workshop.id
    })
      .subscribe({
        next: () => {
          this.selectedIncident.set(null);
          this.selectedWorkshop.set(null);
          this.loadIncidents();
        },
        error: (err: any) => {
          alert('Error al aceptar solicitud: ' + (err.error?.detail || 'Error desconocido'));
          this.loading.set(false);
        }
      });
  }
}
