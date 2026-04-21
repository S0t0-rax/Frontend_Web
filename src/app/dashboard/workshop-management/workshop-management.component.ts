import { Component, OnInit, signal, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkshopService } from '../../core/services/workshop.service';
import { AuthService } from '../../core/services/auth.service';
import { Workshop } from '../../core/models/workshop.model';

@Component({
  selector: 'app-workshop-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './workshop-management.component.html',
  styleUrl: './workshop-management.component.css'
})
export class WorkshopManagementComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  
  workshopForm: FormGroup;
  workshop = signal<Workshop | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  message = signal({ text: '', type: '' });
  mapStatus = signal<'loading' | 'ready' | 'error'>('loading');
  mapError = signal<string | null>(null);
  map?: any;
  private marker?: any;
  private L?: any;
  private readonly defaultCenter: [number, number] = [-17.7833, -63.1821]; // Santa Cruz

  constructor(
    private readonly fb: FormBuilder,
    private readonly workshopService: WorkshopService,
    private readonly authService: AuthService
  ) {
    this.workshopForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      tax_id: [''],
      address_text: ['', [Validators.required, Validators.minLength(5)]],
      latitude: [null, [Validators.required]],
      longitude: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadMyWorkshop();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private async initMap(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.mapStatus.set('loading');
    this.mapError.set(null);

    setTimeout(async () => {
      try {
        console.log('Iniciando carga de Leaflet...');
        const leafletModule = await import('leaflet');
        // Manejar diferencias entre ESM y CommonJS para obtener el objeto L
        this.L = leafletModule.default || leafletModule;
        
        console.log('Leaflet cargado exitosamente. Inicializando mapa...');

        const mapElement = document.getElementById('map');
        if (!mapElement) {
          throw new Error('No se encontró el elemento DOM con id "map"');
        }

        if (this.map) {
          this.map.remove();
        }

        this.map = this.L.map('map', {
          center: this.defaultCenter,
          zoom: 13,
          zoomControl: true,
          fadeAnimation: false
        });

        this.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(this.map);

        const pinIcon = this.L.divIcon({
          className: 'custom-div-icon',
          html: "<div style='background-color:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(0,0,0,0.5);'></div>",
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        this.map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          this.updateCoordinates(lat, lng);
          if (this.marker) this.marker.setLatLng(e.latlng);
          else this.marker = this.L.marker(e.latlng, { icon: pinIcon }).addTo(this.map!);
        });

        const currentWs = this.workshop();
        if (currentWs?.latitude && currentWs?.longitude) {
          this.setMarkerAt(currentWs.latitude, currentWs.longitude);
        }

        setTimeout(() => {
          this.map.invalidateSize();
          this.mapStatus.set('ready');
        }, 200);

      } catch (e: any) {
        console.error('Error FATAL inicializando mapa:', e);
        this.mapStatus.set('error');
        this.mapError.set(e.message || 'Error desconocido');
      }
    }, 300); // Aumentamos un poco el delay para seguridad
  }

  // Método público para el botón de reintento en HTML
  retryMap(): void {
    this.initMap();
  }

  private setMarkerAt(lat: number, lng: number): void {
    if (!this.map || !this.L) return;
    
    const pos = [lat, lng];
    this.map.setView(pos, 16);
    
    const pinIcon = this.L.divIcon({
      className: 'custom-div-icon',
      html: "<div style='background-color:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(0,0,0,0.5);'></div>",
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    if (this.marker) {
      this.marker.setLatLng(pos);
    } else {
      this.marker = this.L.marker(pos, { icon: pinIcon }).addTo(this.map);
    }
  }

  private updateCoordinates(lat: number, lng: number): void {
    this.workshopForm.patchValue({
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6))
    });
  }

  loadMyWorkshop(): void {
    this.isLoading.set(true);
    this.workshopService.getWorkshops().subscribe({
      next: (workshops) => {
        const currentUser = this.authService.currentUser();
        const myWs = workshops.find(w => w.owner_id === currentUser?.id);
        
        if (myWs) {
          this.workshop.set(myWs);
          this.workshopForm.patchValue(myWs);
        }

        this.isLoading.set(false);
        
        // Inicializar el mapa después de que isLoading sea false y el DOM exista
        this.initMap();
      },
      error: () => {
        this.isLoading.set(false);
        this.initMap(); // Intentar cargar mapa aun si falla el fetch
      }
    });
  }

  onSubmit(): void {
    if (this.workshopForm.invalid) return;

    this.isSaving.set(true);
    const formValue = this.workshopForm.value;

    const request$ = this.workshop() 
      ? this.workshopService.updateWorkshop(this.workshop()!.id, formValue)
      : this.workshopService.createWorkshop(formValue);

    request$.subscribe({
      next: (data) => {
        this.workshop.set(data);
        this.showMessage(this.workshop() ? '¡Taller actualizado con éxito!' : '¡Taller registrado con éxito!', 'success');
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error(err);
        this.showMessage('Error al procesar la solicitud.', 'error');
        this.isSaving.set(false);
      }
    });
  }

  showMessage(text: string, type: 'success' | 'error'): void {
    this.message.set({ text, type });
    setTimeout(() => this.message.set({ text: '', type: '' }), 4000);
  }
}
