import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        
        if (err.message === 'ACCESS_DENIED_ROLE') {
          this.errorMessage.set(
            'Acceso denegado. Este panel es solo para personal del taller. Si eres cliente, usa la app móvil.',
          );
        } else if (err.status === 422) {
          // Manejo de errores de validación de FastAPI (422 Unprocessable Entity)
          const details = err.error?.detail;
          if (Array.isArray(details) && details.length > 0) {
            // Tomamos el primer error de la lista y lo "traducimos"
            const firstError = details[0];
            const field = firstError.loc[firstError.loc.length - 1];
            if (field === 'email') {
              this.errorMessage.set('El formato del correo electrónico no es válido.');
            } else {
              this.errorMessage.set(`Datos inválidos: ${firstError.msg}`);
            }
          } else {
            this.errorMessage.set('Los datos enviados no son válidos.');
          }
        } else if (err.status === 401) {
          this.errorMessage.set('Credenciales incorrectas. Verifica tu email y contraseña.');
        } else if (err.status === 409) {
          this.errorMessage.set(err.error?.message ?? 'El usuario ya existe.');
        } else if (err.status === 0) {
          this.errorMessage.set('No se pudo conectar con el servidor. Intenta más tarde.');
        } else {
          this.errorMessage.set(err.error?.message ?? 'Error inesperado. Intenta nuevamente.');
        }
      },
    });
  }
}
