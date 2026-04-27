import { Injectable, signal } from '@angular/core';

export interface DialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type: 'info' | 'confirm' | 'danger';
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  isOpen = signal(false);
  config = signal<DialogConfig | null>(null);
  private resolveFn?: (value: boolean) => void;

  /**
   * Muestra un diálogo de confirmación.
   * Retorna una Promesa que se resuelve con true o false.
   */
  confirm(config: DialogConfig): Promise<boolean> {
    this.config.set(config);
    this.isOpen.set(true);
    
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  /**
   * Cierra el diálogo y retorna la respuesta.
   */
  close(result: boolean): void {
    this.isOpen.set(false);
    if (this.resolveFn) {
      this.resolveFn(result);
    }
  }
}
