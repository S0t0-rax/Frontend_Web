import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-linear-to-br from-purple-600 to-purple-900 flex items-center justify-center px-4">
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-800">Cambiar Contraseña</h1>
          <p class="text-gray-600 mt-2">Actualiza tu contraseña de forma segura</p>
        </div>

        <form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Contraseña Actual</label>
            <input
              type="password"
              formControlName="oldPassword"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              placeholder="Ingresa tu contraseña actual"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">Nueva Contraseña</label>
            <input
              type="password"
              formControlName="newPassword"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              placeholder="Mínimo 6 caracteres"
            />
            <span *ngIf="isFieldInvalid('newPassword')" class="text-red-500 text-sm mt-1 block">
              Mínimo 6 caracteres
            </span>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">Confirmar Contraseña</label>
            <input
              type="password"
              formControlName="confirmPassword"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              placeholder="Confirma tu nueva contraseña"
            />
            <span *ngIf="passwordMismatch()" class="text-red-500 text-sm mt-1 block">
              Las contraseñas no coinciden
            </span>
          </div>

          <div *ngIf="error()" class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p class="text-red-700">{{ error() }}</p>
          </div>

          <div *ngIf="success()" class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p class="text-green-700">{{ success() }}</p>
          </div>

          <button
            type="submit"
            [disabled]="loading() || changePasswordForm.invalid || passwordMismatch()"
            class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
          >
            {{ loading() ? 'Actualizando...' : 'Cambiar Contraseña' }}
          </button>

          <div class="text-center">
            <a [routerLink]="['/dashboard']" class="text-purple-600 font-semibold hover:text-purple-700">
              Volver al panel
            </a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ChangePasswordComponent {
  changePasswordForm!: FormGroup;
  loading = signal(false);
  error = signal('');
  success = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.initForm();
  }

  initForm(): void {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.changePasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  passwordMismatch(): boolean {
    const newPwd = this.changePasswordForm.get('newPassword')?.value;
    const confirmPwd = this.changePasswordForm.get('confirmPassword')?.value;
    return newPwd && confirmPwd && newPwd !== confirmPwd;
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid || this.passwordMismatch()) return;

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.authService.changePassword(this.changePasswordForm.value).subscribe({
      next: () => {
        this.success.set('Contraseña actualizada correctamente');
        this.changePasswordForm.reset();
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cambiar la contraseña');
        this.loading.set(false);
      }
    });
  }
}
