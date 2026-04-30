import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { UserResponse, ROLE_LABELS } from '../../../core/models/auth.model';
import { UserAdminUpdate } from '../../../core/models/admin.model';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {
  readonly roleLabels = ROLE_LABELS;
  
  users = signal<UserResponse[]>([]);
  isLoading = signal(true);
  
  // Edición
  selectedUser = signal<UserResponse | null>(null);
  editForm: FormGroup;
  isSaving = signal(false);

  roles = [
    { value: 'client', label: 'Cliente' },
    { value: 'mechanic', label: 'Mecánico' },
    { value: 'workshop_owner', label: 'Dueño de Taller' },
    { value: 'admin', label: 'Administrador' }
  ];

  constructor(private adminService: AdminService, private fb: FormBuilder, private dialog: DialogService) {
    this.editForm = this.fb.group({
      full_name: [''],
      phone: [''],
      role_name: [''],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  selectUser(user: UserResponse): void {
    this.selectedUser.set(user);
    this.editForm.patchValue({
      full_name: user.full_name,
      phone: user.phone || '',
      role_name: user.roles.length > 0 ? user.roles[0] : 'client',
      is_active: user.is_active
    });
  }

  closeEdit(): void {
    this.selectedUser.set(null);
  }

  saveEdit(): void {
    const user = this.selectedUser();
    if (!user) return;
    
    this.isSaving.set(true);
    const data: UserAdminUpdate = this.editForm.value;
    
    this.adminService.updateUser(user.id, data).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.selectedUser.set(null);
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error al actualizar', err);
        this.isSaving.set(false);
      }
    });
  }

  async logicalDelete(user: UserResponse): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: 'Suspender Usuario',
      message: `¿Estás seguro de suspender a ${user.full_name}?`,
      type: 'danger'
    });

    if (confirmed) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.users.update(list => list.map(u => {
            if(u.id === user.id) return { ...u, is_active: false };
            return u;
          }));
        },
        error: (err) => console.error(err)
      });
    }
  }
}
