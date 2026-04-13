import { WorkshopService, WorkshopPart } from './service.model';
import { User } from './user.model';

export interface Workshop {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  capacity: number;
  currentLoad: number;
  services: WorkshopService[];
  parts: WorkshopPart[];
  user?: User;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateWorkshopRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  capacity: number;
  services: number[];
}

export interface UpdateWorkshopRequest {
  name?: string;
  phone?: string;
  location?: string;
  capacity?: number;
  services?: number[];
}
