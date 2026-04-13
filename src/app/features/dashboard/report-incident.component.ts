import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IncidentService } from '../../core/services/incident.service';

@Component({
  selector: 'app-report-incident',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Reportar Incidente</h1>
          <p class="text-gray-600 mt-2">Describe detalladamente el problema para que podamos ayudarte</p>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-lg shadow p-8">
          <form [formGroup]="incidentForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Ubicación del Incidente</label>
              <input
                type="text"
                formControlName="location"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="Ej: Avenida Principal 123, Ciudad"
              />
              <span *ngIf="isFieldInvalid('location')" class="text-red-500 text-sm mt-1 block">
                Ubicación requerida
              </span>
            </div>

            <div>
              <label class="block text-gray-700 font-semibold mb-2">Descripción del Problema</label>
              <textarea
                formControlName="description"
                rows="5"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="Describe qué le pasó a tu vehículo..."
              ></textarea>
              <span *ngIf="isFieldInvalid('description')" class="text-red-500 text-sm mt-1 block">
                Descripción requerida (mínimo 10 caracteres)
              </span>
            </div>

            <div>
              <label class="block text-gray-700 font-semibold mb-2">Foto del Incidente (Opcional)</label>
              <input
                type="file"
                accept="image/*"
                (change)="onPhotoSelected($event)"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
              <p *ngIf="photoPreview()" class="text-gray-600 text-sm mt-2">
                Foto seleccionada ✓
              </p>
            </div>

            <div>
              <label class="block text-gray-700 font-semibold mb-2">Modelo del Vehículo (Opcional)</label>
              <input
                type="text"
                formControlName="carModel"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="Ej: Toyota Corolla 2020"
              />
            </div>

            <div *ngIf="error()" class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p class="text-red-700">{{ error() }}</p>
            </div>

            <div *ngIf="success()" class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p class="text-green-700">{{ success() }}</p>
            </div>

            <button
              type="submit"
              [disabled]="loading() || incidentForm.invalid"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
            >
              {{ loading() ? 'Reportando...' : 'Reportar Incidente' }}
            </button>
          </form>
        </div>

        <!-- Info Box -->
        <div class="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h3 class="font-bold text-blue-900 mb-2">¿Qué sucede después?</h3>
          <ul class="text-blue-800 text-sm space-y-1">
            <li>✓ Recibirás una confirmación de tu reporte</li>
            <li>✓ Nuestro sistema analizará el incidente automáticamente</li>
            <li>✓ Se buscarán talleres disponibles cercanos</li>
            <li>✓ Te contactaremos con opciones de reparación</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class ReportIncidentComponent {
  incidentForm!: FormGroup;
  loading = signal(false);
  error = signal('');
  success = signal('');
  photoPreview = signal('');

  constructor(
    private fb: FormBuilder,
    private incidentService: IncidentService,
    private router: Router
  ) {
    this.initForm();
  }

  initForm(): void {
    this.incidentForm = this.fb.group({
      location: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      carModel: ['']
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.incidentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.photoPreview.set(file.name);
      // TODO: Handle file upload
    }
  }

  onSubmit(): void {
    if (this.incidentForm.invalid) return;

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    const data = {
      location: this.incidentForm.get('location')?.value,
      description: this.incidentForm.get('description')?.value
    };

    this.incidentService.reportIncident(data).subscribe({
      next: (incident) => {
        this.success.set(`Incidente reportado exitosamente. ID: #${incident.id}`);
        this.incidentForm.reset();
        this.photoPreview.set('');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al reportar incidente');
        this.loading.set(false);
      }
    });
  }
}
