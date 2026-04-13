import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkshopService } from '../../core/services/workshop.service';
import { Workshop } from '../../core/models/workshop.model';
import { Service } from '../../core/models/service.model';

@Component({
  selector: 'app-workshop-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './workshop-management.component.html'
})
export class WorkshopManagementComponent implements OnInit {
  workshopForm!: FormGroup;
  serviceForm!: FormGroup;
  activeTab = signal<'info' | 'services'>('info');
  workshop = signal<Workshop | null>(null);
  workshopServices = signal<any[]>([]);
  availableServices = signal<Service[]>([]);
  loading = signal(true);
  updating = signal(false);
  addingService = signal(false);
  error = signal('');
  success = signal('');

  constructor(
    private fb: FormBuilder,
    private workshopService: WorkshopService,
    private router: Router
  ) {
    this.initForms();
  }

  initForms(): void {
    this.workshopForm = this.fb.group({
      name: ['', Validators.required],
      email: [''],
      phone: ['', Validators.required],
      location: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]]
    });

    this.serviceForm = this.fb.group({
      serviceId: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      duration: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadWorkshop();
    this.loadServices();
  }

  loadWorkshop(): void {
    this.workshopService.getCurrentWorkshop().subscribe({
      next: (workshop) => {
        this.workshop.set(workshop);
        this.workshopServices.set(workshop.services || []);
        this.workshopForm.patchValue({
          name: workshop.name,
          phone: workshop.phone,
          location: workshop.location,
          capacity: workshop.capacity
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar datos del taller');
        this.loading.set(false);
      }
    });
  }

  loadServices(): void {
    this.workshopService.getAllServices().subscribe({
      next: (services) => this.availableServices.set(services),
      error: (err) => console.error('Error loading services:', err)
    });
  }

  updateWorkshop(): void {
    if (this.workshopForm.invalid) return;

    this.updating.set(true);
    this.error.set('');
    this.success.set('');

    const workshop = this.workshop();
    if (!workshop) return;

    this.workshopService.updateWorkshop(workshop.id, this.workshopForm.value).subscribe({
      next: () => {
        this.success.set('Taller actualizado correctamente');
        setTimeout(() => this.success.set(''), 3000);
        this.updating.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al actualizar');
        this.updating.set(false);
      }
    });
  }

  addService(): void {
    if (this.serviceForm.invalid) return;

    this.addingService.set(true);
    this.error.set('');

    const workshop = this.workshop();
    if (!workshop) return;

    const { serviceId, price, duration } = this.serviceForm.value;
    this.workshopService.addServiceToWorkshop(workshop.id, serviceId, price, duration).subscribe({
      next: () => {
        this.loadWorkshop();
        this.serviceForm.reset();
        this.addingService.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al añadir servicio');
        this.addingService.set(false);
      }
    });
  }

  removeService(serviceId: number): void {
    const workshop = this.workshop();
    if (!workshop) return;

    if (confirm('¿Estás seguro de que deseas remover este servicio?')) {
      this.workshopService.removeServiceFromWorkshop(workshop.id, serviceId).subscribe({
        next: () => this.loadWorkshop(),
        error: (err) => this.error.set('Error al remover servicio')
      });
    }
  }
}
