export interface Workshop {
  id: number;
  owner_id?: number;
  name: string;
  tax_id?: string;
  address_text: string;
  latitude: number;
  longitude: number;
  rating?: number;
}

export interface WorkshopCreate {
  name: string;
  tax_id?: string;
  address_text: string;
  latitude: number;
  longitude: number;
}

export interface WorkshopUpdate {
  name?: string;
  address_text?: string;
  latitude?: number;
  longitude?: number;
}
