import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkshopService } from '../../core/services/workshop.service';
import { AuthService } from '../../core/services/auth.service';
import { Workshop } from '../../core/models/workshop.model';

@Component({
  selector: 'app-workshop-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './workshop-management.component.html',
  styleUrl: './workshop-management.component.css'
})
export class WorkshopManagementComponent implements OnInit {
  workshopForm: FormGroup;
  workshop = signal<Workshop | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  message = signal({ text: '', type: '' });

  constructor(
    private readonly fb: FormBuilder,
    private readonly workshopService: WorkshopService,
    private readonly authService: AuthService
  ) {
    this.workshopForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      tax_id: [''],
      address_text: ['', [Validators.required, Validators.minLength(5)]],
      latitude: [null, [Validators.required]],
      longitude: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadMyWorkshop();
  }

  loadMyWorkshop(): void {
    this.isLoading.set(true);
    // Para simplificar en esta fase, buscamos si el usuario ya tiene un taller.
    // En una implementación real, el backend podría tener un endpoint /workshops/me
    // Por ahora, listamos y filtramos (o usamos el ID si lo tuviéramos en el token)
    this.workshopService.getWorkshops().subscribe({
      next: (workshops) => {
        const currentUser = this.authService.currentUserValue;
        const myWs = workshops.find(w => w.owner_id === currentUser?.id);
        if (myWs) {
          this.workshop.set(myWs);
          this.workshopForm.patchValue(myWs);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSubmit(): void {
    if (this.workshopForm.invalid) return;

    this.isSaving.set(true);
    const formValue = this.workshopForm.value;

    if (this.workshop()) {
      this.workshopService.updateWorkshop(this.workshop()!.id, formValue).subscribe({
        next: (updated) => {
          this.workshop.set(updated);
          this.showMessage('¡Taller actualizado con éxito!', 'success');
          this.isSaving.set(false);
        },
        error: (err) => {
          this.showMessage('Error al actualizar el taller', 'error');
          this.isSaving.set(false);
        }
      });
    } else {
      this.workshopService.createWorkshop(formValue).subscribe({
        next: (created) => {
          this.workshop.set(created);
          this.showMessage('¡Taller registrado con éxito!', 'success');
          this.isSaving.set(false);
        },
        error: (err) => {
          this.showMessage('Error al registrar el taller', 'error');
          this.isSaving.set(false);
        }
      });
    }
  }

  showMessage(text: string, type: 'success' | 'error'): void {
    this.message.set({ text, type });
    setTimeout(() => this.message.set({ text: '', type: '' }), 4000);
  }

  openCoordinatesGuide(): void {
    window.open('https://www.google.com/maps', '_blank');
  }
}
