import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Incident } from '../../../core/models/incident.model';

@Component({
  selector: 'app-incident-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="incident-card" [ngClass]="incident.severity_level">
      <div class="card-header">
        <span class="badge" [ngClass]="incident.status">{{ incident.status | titlecase }}</span>
        <span class="date">{{ incident.reported_at | date:'short' }}</span>
      </div>
      
      <div class="card-body">
        <h4 class="car-info">Ticket #{{ incident.id }}</h4>
        <p class="description">{{ incident.description || 'Sin descripción' }}</p>
        <div class="location-ref">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>{{ incident.address_reference || 'Ubicación GPS' }}</span>
        </div>
      </div>

      <div class="card-footer">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .incident-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .incident-card:hover {
      transform: translateY(-4px);
      background: rgba(255, 255, 255, 0.08);
      border-color: var(--accent);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .badge {
      font-size: 0.7rem;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge.open { background: #3b82f6; color: white; }
    .badge.accepted { background: #8b5cf6; color: white; }
    .badge.in_progress { background: #f59e0b; color: white; }
    .badge.completed { background: #10b981; color: white; }
    
    .date { font-size: 0.75rem; color: rgba(255, 255, 255, 0.5); }
    .car-info { margin: 0; font-size: 1.1rem; color: var(--accent); }
    .description { font-size: 0.9rem; color: rgba(255, 255, 255, 0.8); line-height: 1.4; }
    .location-ref { display: flex; align-items: center; gap: 6px; color: rgba(255, 255, 255, 0.6); font-size: 0.85rem; }
    
    .card-footer {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    
    /* Severity backgrounds */
    .critical { border-left: 4px solid #ef4444; }
    .high { border-left: 4px solid #f97316; }
    .medium { border-left: 4px solid #facc15; }
    .low { border-left: 4px solid #3b82f6; }
  `]
})
export class IncidentCardComponent {
  @Input({ required: true }) incident!: Incident;
}
