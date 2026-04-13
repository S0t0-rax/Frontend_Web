export interface Service {
  id: number;
  name: string;
}

export interface WorkshopService {
  id: number;
  serviceId: number;
  service?: Service;
  price: number;
  estimatedDuration: string;
}

export interface WorkshopPart {
  id: number;
  partId: number;
  part?: Part;
  quantity: number;
}

export interface Part {
  id: number;
  name: string;
  carModel: string;
}

export interface Car {
  id: number;
  model: string;
  licensePlate: string;
}
