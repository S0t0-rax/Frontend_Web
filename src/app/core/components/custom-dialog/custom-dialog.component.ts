import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-custom-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" *ngIf="dialog.isOpen()" (click)="onCancel()">
      <div class="dialog-card" (click)="$event.stopPropagation()" [class.danger]="dialog.config()?.type === 'danger'">
        <div class="dialog-header">
          <h2>{{ dialog.config()?.title }}</h2>
        </div>
        <div class="dialog-body">
          <p>{{ dialog.config()?.message }}</p>
        </div>
        <div class="dialog-footer">
          <button *ngIf="dialog.config()?.type !== 'info'" class="btn-cancel" (click)="onCancel()">{{ dialog.config()?.cancelText || 'Cancelar' }}</button>
          <button class="btn-confirm" (click)="onConfirm()">{{ dialog.config()?.confirmText || 'Aceptar' }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease;
    }

    .dialog-card {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2rem;
      width: 90%;
      max-width: 450px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #f8fafc;
      font-weight: 700;
    }

    .dialog-body {
      margin: 1.5rem 0 2rem;
    }

    .dialog-body p {
      color: #94a3b8;
      line-height: 1.6;
      margin: 0;
      font-size: 1.1rem;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    button {
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-cancel {
      background: rgba(255, 255, 255, 0.05);
      color: #94a3b8;
    }

    .btn-cancel:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .btn-confirm {
      background: #3b82f6;
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .btn-confirm:hover {
      background: #2563eb;
      transform: translateY(-2px);
    }

    .dialog-card.danger {
      border-color: rgba(239, 68, 68, 0.3);
    }

    .dialog-card.danger .btn-confirm {
      background: #ef4444;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .dialog-card.danger .btn-confirm:hover {
      background: #dc2626;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class CustomDialogComponent {
  dialog = inject(DialogService);

  onConfirm(): void {
    this.dialog.close(true);
  }

  onCancel(): void {
    this.dialog.close(false);
  }
}
