import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { WorkshopService } from '../../core/services/workshop.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-gestion-personal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
  // edición de asignación
  editingId: number | null = null;
  editingWorkshopSelection: number | null = null;
  assignEndpointAvailable = signal(false);
  
  mechanicToDelete: any = null;

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
    // Cargar primero los talleres del dueño; loadWorkshops llamará a loadStaff cuando estén listos
    this.loadWorkshops();
    // Verificar si el backend soporta la ruta de asignación (evita botones rotos contra backend antiguo)
    this.userService.checkAssignEndpoint().subscribe(ok => this.assignEndpointAvailable.set(ok));
  }

  loadStaff(): void {
    this.isLoading.set(true);
    this.userService.getMyStaff().subscribe({
      next: (s) => {
        // Mapear workshop_name si no viene desde el backend
        const list = (s as any[]).map(item => {
          const found = this.workshops.find(w => {
            try {
              return String(w.id) === String(item.workshop_id) || Number(w.id) === Number(item.workshop_id);
            } catch { return false; }
          });
          return {
            ...item,
            workshop_name: item.workshop_name || item.workshop?.name || (found ? found.name : '-')
          };
        });
        this.staff.set(list as any[]);
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
        // Una vez cargados los talleres, cargar el personal para poder mapear nombres
        this.loadStaff();
      }
    });
  }

  startEditAssignment(mech: any): void {
    this.editingId = mech.id;
    // prefer workshop_id, fallback to undefined
    this.editingWorkshopSelection = mech.workshop_id ?? null;
  }

  cancelEditAssignment(): void {
    this.editingId = null;
    this.editingWorkshopSelection = null;
  }

  saveAssignment(mech: any): void {
    const wid = this.editingWorkshopSelection === null ? undefined : Number(this.editingWorkshopSelection);
    this.userService.assignMechanicWorkshop(mech.id, wid).subscribe({
      next: (updated) => {
        // actualizar en la lista local (usar any para campos dinámicos que no están en el UserResponse)
        const u: any = updated as any;
        this.staff.update(list => list.map(s => s.id === u.id ? ({ ...s, workshop_id: u.workshop_id, workshop_name: u.workshop_name || u.workshop?.name || this.workshops.find(w=>String(w.id)===String(u.workshop_id))?.name || '-' }) : s));
        this.showMessage('Asignación actualizada.', 'success');
        this.cancelEditAssignment();
      },
      error: (err) => {
        console.error('Error asignando taller', err);
        if (err.status === 404) {
          this.showMessage('Endpoint de asignación no disponible en el backend (404). Actualiza/despliega el backend con la ruta /users/{id}/assign-workshop.', 'error');
        } else if (err.status === 403) {
          this.showMessage('No tienes permisos para asignar este mecánico al taller seleccionado (403).', 'error');
        } else {
          this.showMessage('Error al asignar taller.', 'error');
        }
      }
    });
  }

  createMechanic(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.isCreating.set(true);
    const { email, password, full_name, phone } = this.createForm.value;
    // asegurar que workshop_id sea number o undefined
    const rawWorkshopId = this.createForm.value.workshop_id;
    const workshop_id = rawWorkshopId === null || rawWorkshopId === undefined ? undefined : Number(rawWorkshopId);

    this.userService.createMechanic({ email, password, full_name, phone }, workshop_id).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.showMessage('Mecánico creado correctamente.', 'success');
        this.createForm.reset({ workshop_id: null });
        this.loadStaff();
      },
      error: (err) => {
        this.isCreating.set(false);
        if (err.status === 409) {
          this.showMessage('Correo ya registrado.', 'error');
        } else if (err.status === 422) {
          // Mostrar detalles de validación si vienen del backend
          const details = err.error?.detail;
          if (Array.isArray(details) && details.length > 0) {
            const first = details[0];
            const field = first.loc?.[first.loc.length - 1];
            this.showMessage(field ? `Dato inválido: ${first.msg} (${field})` : `Dato inválido: ${first.msg}`, 'error');
          } else {
            this.showMessage('Los datos enviados no son válidos.', 'error');
          }
        } else if (err.status === 0) {
          this.showMessage('No se pudo conectar con el servidor.', 'error');
        } else {
          this.showMessage(err.error?.message ?? 'Error creando mecánico.', 'error');
        }
      }
    });
  }

  searchQuery = signal('');
  
  // Lista filtrada de personal según la búsqueda y filtrando los inactivos
  filteredStaff = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    // Siempre ocultamos los mecánicos eliminados (is_active === false)
    const activeStaff = this.staff().filter(s => s.is_active !== false);
    
    if (!query) return activeStaff;
    
    return activeStaff.filter(s => {
      const matchName = s.full_name?.toLowerCase().includes(query) || false;
      const matchEmail = s.email?.toLowerCase().includes(query) || false;
      const matchWorkshop = s.workshop_name?.toLowerCase().includes(query) || false;
      const matchTicket = s.active_incident_ids?.some((id: number) => id.toString().includes(query)) || false;
      
      return matchName || matchEmail || matchWorkshop || matchTicket;
    });
  });

  showMessage(text: string, type: 'success'|'error') {
    this.message.set({ text, type });
    setTimeout(() => this.message.set({ text: '', type: '' }), 4000);
  }

  confirmDelete(mech: any): void {
    this.mechanicToDelete = mech;
  }

  cancelDelete(): void {
    this.mechanicToDelete = null;
  }

  executeDelete(): void {
    if (!this.mechanicToDelete) return;
    const mech = this.mechanicToDelete;
    
    this.userService.deleteMechanic(mech.id).subscribe({
      next: () => {
        this.showMessage('Mecánico eliminado correctamente.', 'success');
        this.loadStaff();
        this.mechanicToDelete = null;
      },
      error: (err) => {
        console.error(err);
        this.showMessage('Error al eliminar el mecánico.', 'error');
        this.mechanicToDelete = null;
      }
    });
  }
}
