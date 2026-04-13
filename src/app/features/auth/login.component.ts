import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-linear-to-br from-blue-600 to-blue-900 flex items-center justify-center px-4">
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">SERVMECA</h1>
          <p class="text-gray-600 mt-2">Sistema de Auxilio y Reparación Automotriz</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              formControlName="email"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
              placeholder="correo@example.com"
            />
            <span *ngIf="isFieldInvalid('email')" class="text-red-500 text-sm mt-1 block">
              Email inválido
            </span>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">Contraseña</label>
            <input
              type="password"
              formControlName="password"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
              placeholder="Ingrese su contraseña"
            />
            <span *ngIf="isFieldInvalid('password')" class="text-red-500 text-sm mt-1 block">
              Contraseña requerida
            </span>
          </div>

          <div *ngIf="error()" class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p class="text-red-700">{{ error() }}</p>
          </div>

          <button
            type="submit"
            [disabled]="loading() || loginForm.invalid"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition duration-200"
          >
            {{ loading() ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-600">
            ¿No tienes cuenta?
            <a routerLink="/register" class="text-blue-600 font-semibold hover:text-blue-700">
              Regístrate aquí
            </a>
          </p>
        </div>

        <div class="mt-4 text-center border-t pt-4">
          <p class="text-gray-600 text-sm mb-3">¿Eres un taller mecánico?</p>
          <a
            routerLink="/register-workshop"
            class="text-blue-600 font-semibold hover:text-blue-700"
          >
            Registra tu taller
          </a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm!: FormGroup;
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
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al iniciar sesión');
        this.loading.set(false);
      }
    });
  }
}
