import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserUpdate, ChangePasswordRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  isProfileLoading = signal(false);
  isPasswordLoading = signal(false);
  
  profileMessage = signal<{text: string, type: 'success' | 'error'} | null>(null);
  passwordMessage = signal<{text: string, type: 'success' | 'error'} | null>(null);

  activeTab = signal<'data' | 'security'>('data');

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.maxLength(20)]]
    });

    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        full_name: user.full_name,
        phone: user.phone || ''
      });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('new_password')?.value === g.get('confirm_password')?.value
      ? null : { mismatch: true };
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.isProfileLoading.set(true);
    this.profileMessage.set(null);

    const data: UserUpdate = this.profileForm.value;
    this.authService.updateProfile(data).subscribe({
      next: () => {
        this.isProfileLoading.set(false);
        this.profileMessage.set({ text: 'Perfil actualizado con éxito.', type: 'success' });
      },
      error: (err) => {
        this.isProfileLoading.set(false);
        this.profileMessage.set({ text: 'Error al actualizar el perfil.', type: 'error' });
      }
    });
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) return;

    this.isPasswordLoading.set(true);
    this.passwordMessage.set(null);

    const { current_password, new_password } = this.passwordForm.value;
    const data: ChangePasswordRequest = { current_password, new_password };

    this.authService.changePassword(data).subscribe({
      next: () => {
        this.isPasswordLoading.set(false);
        this.passwordMessage.set({ text: 'Contraseña actualizada correctamente.', type: 'success' });
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isPasswordLoading.set(false);
        const detail = err.error?.detail || 'Error al cambiar la contraseña.';
        this.passwordMessage.set({ text: detail, type: 'error' });
      }
    });
  }
}
