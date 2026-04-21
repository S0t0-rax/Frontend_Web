import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  /** Opciones de rol disponibles en el registro público */
  roleOptions = [
    { value: 'client', label: 'Cliente', icon: '👤' },
    { value: 'workshop_owner', label: 'Dueño de Taller', icon: '🏭' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        full_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.maxLength(20)]],
        role: ['client', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatchValidator },
    );
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  /** Validador personalizado: contraseñas deben coincidir */
  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  /** Calcula la fortaleza de la contraseña (0-4) */
  getPasswordStrength(): number {
    const password = this.registerForm.get('password')?.value ?? '';
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }

  getPasswordStrengthLabel(): string {
    const s = this.getPasswordStrength();
    if (s === 0) return '';
    if (s === 1) return 'Débil';
    if (s === 2) return 'Regular';
    if (s === 3) return 'Buena';
    return 'Fuerte';
  }

  getPasswordStrengthClass(): string {
    const s = this.getPasswordStrength();
    if (s <= 1) return 'weak';
    if (s === 2) return 'fair';
    if (s === 3) return 'good';
    return 'strong';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { confirmPassword, role, ...restData } = this.registerForm.value;
    const userData = { ...restData, role_name: role };

    this.authService.register(userData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...');
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 409) {
          this.errorMessage.set('Este correo electrónico ya está registrado.');
        } else if (err.status === 422) {
          const details = err.error?.detail;
          if (Array.isArray(details) && details.length > 0) {
            const firstError = details[0];
            const field = firstError.loc[firstError.loc.length - 1];
            if (field === 'email') {
              this.errorMessage.set('El formato del correo electrónico no es válido.');
            } else {
              this.errorMessage.set(`Dato inválido: ${firstError.msg}`);
            }
          } else {
            this.errorMessage.set('Los datos enviados no son válidos.');
          }
        } else if (err.status === 0) {
          this.errorMessage.set('No se pudo conectar con el servidor. Intenta más tarde.');
        } else {
          this.errorMessage.set(err.error?.message ?? 'Error inesperado. Intenta nuevamente.');
        }
      },
    });
  }
}
