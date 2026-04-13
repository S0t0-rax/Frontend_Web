import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-linear-to-br from-blue-600 to-blue-900 flex items-center justify-center px-4 py-8">
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-gray-800">SERVMECA</h1>
          <p class="text-gray-600 mt-1 text-sm">Registro de Usuario</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-1 text-sm">Nombre</label>
            <input
              type="text"
              formControlName="name"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              placeholder="Tu nombre completo"
            />
            <span *ngIf="isFieldInvalid('name')" class="text-red-500 text-xs mt-1 block">
              Nombre requerido
            </span>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-1 text-sm">Email</label>
            <input
              type="email"
              formControlName="email"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              placeholder="correo@example.com"
            />
            <span *ngIf="isFieldInvalid('email')" class="text-red-500 text-xs mt-1 block">
              Email inválido
            </span>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-1 text-sm">Teléfono</label>
            <input
              type="tel"
              formControlName="phone"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              placeholder="+34 612 345 678"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-1 text-sm">Ubicación</label>
            <input
              type="text"
              formControlName="location"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              placeholder="Ciudad, Provincia"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-1 text-sm">Contraseña</label>
            <input
              type="password"
              formControlName="password"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              placeholder="Mínimo 6 caracteres"
            />
            <span *ngIf="isFieldInvalid('password')" class="text-red-500 text-xs mt-1 block">
              Mínimo 6 caracteres
            </span>
          </div>

          <div *ngIf="error()" class="bg-red-50 border-l-4 border-red-500 p-3 rounded">
            <p class="text-red-700 text-sm">{{ error() }}</p>
          </div>

          <button
            type="submit"
            [disabled]="loading() || registerForm.invalid"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition"
          >
            {{ loading() ? 'Registrando...' : 'Registrarse' }}
          </button>
        </form>

        <div class="mt-4 text-center text-sm">
          <p class="text-gray-600">
            ¿Ya tienes cuenta?
            <a routerLink="/login" class="text-blue-600 font-semibold hover:text-blue-700">
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm!: FormGroup;
  loading = signal(false);
  error = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.initForm();
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      location: [''],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading.set(true);
    this.error.set('');

    const data = {
      ...this.registerForm.value,
      roleId: 3 // usuario regular
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al registrarse');
        this.loading.set(false);
      }
    });
  }
}
