import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { WorkshopService } from '../../core/services/workshop.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-gestion-personal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion-personal.component.html',
  styleUrl: './gestion-personal.component.css'
})
export class GestionPersonalComponent implements OnInit {
  staff = signal<any[]>([]);
  isLoading = signal(false);
  isCreating = signal(false);
  message = signal({ text: '', type: '' });

  createForm: FormGroup;
  workshops: any[] = [];

  constructor(
    private readonly userService: UserService,
    private readonly workshopService: WorkshopService,
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
  ) {
    this.createForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      workshop_id: [null]
    });
  }

  ngOnInit(): void {
    this.loadStaff();
    this.loadWorkshops();
  }

  loadStaff(): void {
    this.isLoading.set(true);
    this.userService.getMyStaff().subscribe({
      next: (s) => {
        this.staff.set(s as any[]);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showMessage('Error cargando personal.', 'error');
      }
    });
  }

  loadWorkshops(): void {
    this.workshopService.getWorkshops().subscribe({
      next: (ws) => {
        const currentUser = this.authService.currentUser();
        // Filtrar talleres del dueño
        this.workshops = ws.filter((w: any) => w.owner_id === currentUser?.id);
      }
    });
  }

  createMechanic(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.isCreating.set(true);
    const { email, password, full_name, phone, workshop_id } = this.createForm.value;
    this.userService.createMechanic({ email, password, full_name, phone }, workshop_id || undefined).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.showMessage('Mecánico creado correctamente.', 'success');
        this.createForm.reset({ workshop_id: null });
        this.loadStaff();
      },
      error: (err) => {
        this.isCreating.set(false);
        const msg = err.status === 409 ? 'Correo ya registrado.' : 'Error creando mecánico.';
        this.showMessage(msg, 'error');
      }
    });
  }

  showMessage(text: string, type: 'success'|'error') {
    this.message.set({ text, type });
    setTimeout(() => this.message.set({ text: '', type: '' }), 4000);
  }
}
