import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentService } from '../../../core/services/incident.service';
import { Incident, IncidentStatus } from '../../../core/models/incident.model';
import { IncidentCardComponent } from '../../../shared/components/incident-card/incident-card';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-mechanic-tasks',
  standalone: true,
  imports: [CommonModule, IncidentCardComponent],
  template: `
    <div class="mechanic-container">
      <header class="page-header">
        <div>
          <h1>Mis Trabajos Asignados</h1>
          <p class="subtitle">Gestiona tus reparaciones y estados de llegada</p>
        </div>
        <button class="btn-refresh" (click)="loadTasks()" [disabled]="loading()">
          <svg *ngIf="!loading()" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
          <span *ngIf="loading()" class="spinner"></span>
          Actualizar
        </button>
      </header>

      <div class="filters">
        <button [class.active]="filter() === 'all'" (click)="filter.set('all')">Todos</button>
        <button [class.active]="filter() === 'assigned'" (click)="filter.set('assigned')">Por Atender</button>
        <button [class.active]="filter() === 'in_progress'" (click)="filter.set('in_progress')">En Curso</button>
      </div>

      <div class="tasks-grid" *ngIf="!loading() && filteredTasks().length > 0">
        <app-incident-card *ngFor="let task of filteredTasks()" [incident]="task">
          <div class="mechanic-actions">
            <div class="action-group">
              <label>Estado del Viaje</label>
              <div class="select-wrapper">
                <select [value]="task.arrival_status || 'pending'" (change)="updateArrivalStatus(task, $event)">
                  <option value="pending">Pendiente</option>
                  <option value="on_the_way">En Camino</option>
                  <option value="arrived">Llegué</option>
                  <option value="in_workshop">En Taller</option>
                  <option value="delayed">Retrasado</option>
                </select>
              </div>
            </div>

            <div class="action-group">
              <label>Control de Reparación</label>
              <div class="button-row">
                <button *ngIf="task.status === 'assigned'" class="btn-start" (click)="updateIncidentStatus(task.id, 'in_progress')">
                  Iniciar Trabajo
                </button>
                <button *ngIf="task.status === 'in_progress'" class="btn-done" (click)="updateIncidentStatus(task.id, 'resolved')">
                  Finalizar
                </button>
                <button class="btn-cancel" (click)="updateIncidentStatus(task.id, 'rejected')">
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </app-incident-card>
      </div>

      <div class="empty-state" *ngIf="!loading() && filteredTasks().length === 0">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-muted"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
        <h3>No hay tareas</h3>
        <p>No se encontraron trabajos con el filtro seleccionado.</p>
      </div>
    </div>
  `,
  styles: [`
    .mechanic-container { padding: 24px; animation: fadeIn 0.5s ease; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    h1 { font-size: 1.8rem; margin: 0; background: linear-gradient(135deg, #fff 0%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { color: #94a3b8; margin: 4px 0 0; }

    .btn-refresh { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .btn-refresh:hover:not(:disabled) { background: rgba(255,255,255,0.1); border-color: var(--accent); }

    .filters { display: flex; gap: 12px; margin-bottom: 24px; }
    .filters button { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 8px 16px; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
    .filters button.active { background: var(--accent); color: white; border-color: var(--accent); }

    .tasks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }

    .mechanic-actions { display: flex; flex-direction: column; gap: 16px; width: 100%; }
    .action-group { display: flex; flex-direction: column; gap: 8px; }
    .action-group label { font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.05em; }

    .select-wrapper select { width: 100%; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 10px; border-radius: 8px; cursor: pointer; }

    .button-row { display: flex; gap: 8px; }
    .button-row button { flex: 1; padding: 10px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; transition: all 0.2s; font-size: 0.85rem; }

    .btn-start { background: #8b5cf6; color: white; }
    .btn-done { background: #10b981; color: white; }
    .btn-cancel { background: rgba(239, 68, 68, 0.1); color: #ef4444; flex: 0 0 auto !important; }
    
    .btn-start:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-done:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-cancel:hover { background: #ef4444; color: white; }

    .empty-state { text-align: center; padding: 80px 0; color: #64748b; }
    .text-muted { color: #334155; margin-bottom: 16px; }

    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class TasksComponent implements OnInit {
  private readonly incidentService = inject(IncidentService);
  private readonly dialog = inject(DialogService);
  
  tasks = signal<Incident[]>([]);
  loading = signal(false);
  filter = signal<'all' | 'assigned' | 'in_progress'>('all');

  filteredTasks = computed(() => {
    const f = this.filter();
    if (f === 'all') return this.tasks();
    return this.tasks().filter(t => t.status === f);
  });

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading.set(true);
    this.incidentService.getMechanicTasks().subscribe({
      next: (t) => {
        this.tasks.set(t);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateArrivalStatus(task: any, event: Event) {
    const status = (event.target as HTMLSelectElement).value;
    const soId = (task as any).service_order_id;
    if (!soId) return;

    this.incidentService.updateServiceOrder(soId, { arrival_status: status }).subscribe({
      next: () => this.loadTasks(),
      error: (err) => {
        console.error('Error al actualizar estado de llegada:', err);
        this.dialog.confirm({ title: 'Error', message: 'No se pudo actualizar el estado de llegada. Por favor, intenta de nuevo.', type: 'danger' });
      }
    });
  }

  updateIncidentStatus(id: number, status: IncidentStatus) {
    this.incidentService.updateIncident(id, { status }).subscribe({
      next: () => this.loadTasks(),
      error: (err) => {
        console.error('Error al actualizar estado del incidente:', err);
        this.dialog.confirm({ title: 'Error', message: 'Hubo un error al procesar la solicitud. Por favor, intenta de nuevo.', type: 'danger' });
      }
    });
  }
}
