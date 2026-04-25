import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { IncidentGlobalResponse } from '../../../core/models/admin.model';

@Component({
  selector: 'app-global-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monitoring.html',
  styleUrl: './monitoring.css'
})
export class MonitoringComponent implements OnInit {
  incidents = signal<IncidentGlobalResponse[]>([]);
  isLoading = signal(true);

  activeCount = computed(() => {
    return this.incidents().filter(i => i.status === 'assigned' || i.status === 'in_progress').length;
  });


  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.isLoading.set(true);
    this.adminService.getGlobalIncidents().subscribe({
      next: (data) => {
        this.incidents.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'open': 'Abierto',
      'assigned': 'Asignado',
      'in_progress': 'En Progreso',
      'resolved': 'Resuelto',
      'rejected': 'Rechazado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }
}
