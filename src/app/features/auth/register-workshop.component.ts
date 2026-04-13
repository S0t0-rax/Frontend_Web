import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WorkshopService } from '../../core/services/workshop.service';
import { Service } from '../../core/models/service.model';

@Component({
  selector: 'app-register-workshop',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-linear-to-br from-green-600 to-green-900 flex items-center justify-center px-4 py-8">
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-8">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-gray-800">SERVMECA</h1>
          <p class="text-gray-600 mt-1 text-sm">Registro de Taller Mecánico</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 font-semibold mb-1 text-sm">Nombre del Taller</label>
              <input
                type="text"
                formControlName="name"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                placeholder="Nombre del taller"
              />
              <span *ngIf="isFieldInvalid('name')" class="text-red-500 text-xs block mt-1">
                Requerido
              </span>
            </div>

            <div>
              <label class="block text-gray-700 font-semibold mb-1 text-sm">Email</label>
              <input
                type="email"
                formControlName="email"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                placeholder="correo@taller.com"
              />
              <span *ngIf="isFieldInvalid('email')" class="text-red-500 text-xs block mt-1">
                Email inválido
              </span>
            </div>

            <div>
              <label class="block text-gray-700 font-semibold mb-1 text-sm">Teléfono</label>
              <input
                type="tel"
                formControlName="phone"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                placeholder="+34 612 345 678"
              />
              <span *ngIf="isFieldInvalid('phone')" class="text-red-500 text-xs block mt-1">
                Requerido
              </span>
            </div>

            <div>
              <label class="block text-gray-700 font-semibold mb-1 text-sm">Ubicación</label>
              <input
                type="text"
                formControlName="location"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                placeholder="Ciudad, Provincia"
              />
              <span *ngIf="isFieldInvalid('location')" class="text-red-500 text-xs block mt-1">
                Requerido
              </span>
            </div>

            <div>
              <label class="block text-gray-700 font-semibold mb-1 text-sm">Capacidad (Autos)</label>
              <input
                type="number"
                formControlName="capacity"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                placeholder="5"
                min="1"
              />
              <span *ngIf="isFieldInvalid('capacity')" class="text-red-500 text-xs block mt-1">
                Requerido
              </span>
            </div>

            <div>
              <label class="block text-gray-700 font-semibold mb-1 text-sm">Contraseña</label>
              <input
                type="password"
                formControlName="password"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                placeholder="Mínimo 6 caracteres"
              />
              <span *ngIf="isFieldInvalid('password')" class="text-red-500 text-xs block mt-1">
                Mínimo 6 caracteres
              </span>
            </div>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2 text-sm">Servicios que Realizas</label>
            <div class="space-y-2 max-h-48 overflow-y-auto border-2 border-gray-300 rounded-lg p-3">
              <div *ngFor="let service of services()" class="flex items-center">
                <input
                  type="checkbox"
                  [id]="'service-' + service.id"
                  [value]="service.id"
                  (change)="toggleService($event, service.id)"
                  class="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-600"
                />
                <label [for]="'service-' + service.id" class="ml-2 text-gray-700">
                  {{ service.name }}
                </label>
              </div>
            </div>
          </div>

          <div *ngIf="error()" class="bg-red-50 border-l-4 border-red-500 p-3 rounded">
            <p class="text-red-700 text-sm">{{ error() }}</p>
          </div>

          <button
            type="submit"
            [disabled]="loading() || registerForm.invalid"
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
          >
            {{ loading() ? 'Registrando...' : 'Registrar Taller' }}
          </button>
        </form>

        <div class="mt-4 text-center text-sm">
          <p class="text-gray-600">
            ¿Ya tienes cuenta?
            <a routerLink="/login" class="text-green-600 font-semibold hover:text-green-700">
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterWorkshopComponent {
  registerForm!: FormGroup;
  loading = signal(false);
  error = signal('');
  services = signal<Service[]>([]);
  selectedServices = signal<number[]>([]);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private workshopService: WorkshopService,
    private router: Router
  ) {
    this.initForm();
    this.loadServices();
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      location: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  loadServices(): void {
    this.workshopService.getAllServices().subscribe({
      next: (services) => this.services.set(services),
      error: (err) => this.error.set('Error al cargar servicios')
    });
  }

  toggleService(event: Event, serviceId: number): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.selectedServices();
    if (checked) {
      this.selectedServices.set([...current, serviceId]);
    } else {
      this.selectedServices.set(current.filter(id => id !== serviceId));
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.selectedServices().length === 0) {
      this.error.set('Por favor selecciona al menos un servicio');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const data = {
      ...this.registerForm.value,
      services: this.selectedServices()
    };

    this.authService.registerWorkshop(data).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al registrar taller');
        this.loading.set(false);
      }
    });
  }
}
