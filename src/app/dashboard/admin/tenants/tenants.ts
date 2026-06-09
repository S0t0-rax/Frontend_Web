import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TenantService } from '../../../core/services/tenant.service';
import { Tenant, TenantRegistrationRequest } from '../../../core/models/tenant.model';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tenants.html',
  styleUrl: './tenants.css'
})
export class TenantsComponent implements OnInit {
  tenants = signal<Tenant[]>([]);
  isLoading = signal(true);
  
  showModal = signal(false);
  isSaving = signal(false);
  registerForm: FormGroup;

  constructor(
    private tenantService: TenantService, 
    private fb: FormBuilder,
    private dialog: DialogService
  ) {
    this.registerForm = this.fb.group({
      tenant_name: ['', Validators.required],
      tax_id: [''],
      admin_full_name: ['', Validators.required],
      admin_email: ['', [Validators.required, Validators.email]],
      admin_password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.isLoading.set(true);
    this.tenantService.getTenants().subscribe({
      next: (data) => {
        this.tenants.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando tenants', err);
        this.isLoading.set(false);
      }
    });
  }

  openRegisterModal(): void {
    this.registerForm.reset();
    // Generar contraseña segura por defecto
    const randomPwd = Math.random().toString(36).slice(-8) + 'A1!';
    this.registerForm.patchValue({ admin_password: randomPwd });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitRegister(): void {
    if (this.registerForm.invalid) return;

    this.isSaving.set(true);
    const data: TenantRegistrationRequest = this.registerForm.value;

    this.tenantService.registerTenant(data).subscribe({
      next: (newTenant) => {
        // Recargar la lista
        this.loadTenants();
        this.closeModal();
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error registrando empresa', err);
        alert(err.error?.detail || 'Ocurrió un error al registrar la empresa');
        this.isSaving.set(false);
      }
    });
  }

  async toggleStatus(tenant: Tenant): Promise<void> {
    const action = tenant.is_active ? 'suspender' : 'reactivar';
    const confirmed = await this.dialog.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Empresa`,
      message: `¿Estás seguro de que deseas ${action} a la empresa "${tenant.name}"? ${tenant.is_active ? 'Sus empleados ya no podrán usar el sistema.' : ''}`,
      type: tenant.is_active ? 'danger' : 'info'
    });

    if (confirmed) {
      const newStatus = !tenant.is_active;
      this.tenantService.updateTenant(tenant.id, { is_active: newStatus }).subscribe({
        next: (updated) => {
          this.tenants.update(list => list.map(t => t.id === updated.id ? updated : t));
        },
        error: (err) => console.error('Error cambiando estado', err)
      });
    }
  }
}
