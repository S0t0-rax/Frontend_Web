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
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  passwordForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.passwordForm = this.fb.group(
      {
        current_password: ['', [Validators.required]],
        new_password: ['', [Validators.required, Validators.minLength(8)]],
        confirm_password: ['', [Validators.required]],
      },
      { validators: this.passwordsMatchValidator },
    );
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword.update((v) => !v);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPwd = control.get('new_password')?.value;
    const confirmPwd = control.get('confirm_password')?.value;
    if (newPwd && confirmPwd && newPwd !== confirmPwd) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  getPasswordStrength(): number {
    const password = this.passwordForm.get('new_password')?.value ?? '';
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
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { confirm_password, ...data } = this.passwordForm.value;

    this.authService.changePassword(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Contraseña actualizada exitosamente.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 400 || err.status === 401) {
          this.errorMessage.set('La contraseña actual es incorrecta.');
        } else if (err.status === 0) {
          this.errorMessage.set('No se pudo conectar con el servidor.');
        } else {
          this.errorMessage.set(err.error?.detail ?? 'Error inesperado. Intenta nuevamente.');
        }
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
