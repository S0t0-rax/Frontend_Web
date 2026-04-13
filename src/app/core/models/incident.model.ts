import { Service } from './service.model';

export interface Incident {
  id: number;
  userId: number;
  carId?: number;
  photo?: string;
  description: string;
  location: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  reportedAt: Date;
  updatedAt?: Date;
}

export interface Appointment {
  id: number;
  incidentId: number;
  serviceId: number;
  service?: Service;
  appointmentDate: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  estimatedArrivalTime?: string;
  mechanicId: number;
  arrivalStatus: 'en espera' | 'en proceso' | 'atendido' | 'cancelado';
  serviceStatus: 'en proceso' | 'completado' | 'cancelado';
}

export interface AIAnalysis {
  id: number;
  incidentId: number;
  analysisResult: string;
  createdAt: Date;
}
