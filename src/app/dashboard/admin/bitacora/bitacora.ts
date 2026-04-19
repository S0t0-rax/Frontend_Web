import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { AuditLogResponse } from '../../../core/models/admin.model';

@Component({
  selector: 'app-bitacora',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bitacora.html',
  styleUrl: './bitacora.css'
})
export class Bitacora implements OnInit {
  logs = signal<AuditLogResponse[]>([]);
  isLoading = signal(true);
  
  // Data for View Modal
  selectedLog = signal<AuditLogResponse | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading.set(true);
    this.adminService.getAuditLogs().subscribe({
      next: (data) => {
        this.logs.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  viewDetails(log: AuditLogResponse): void {
    this.selectedLog.set(log);
  }

  closeDetails(): void {
    this.selectedLog.set(null);
  }

  formatJson(obj: any): string {
    if (!obj) return 'Ningún detalle';
    return JSON.stringify(obj, null, 2);
  }
}
