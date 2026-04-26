export interface Workshop {
  id: number;
  owner_id?: number;
  name: string;
  tax_id?: string;
  address_text: string;
  latitude: number;
  longitude: number;
  rating?: number;
  is_available: boolean;
}

export interface WorkshopCreate {
  name: string;
  tax_id?: string;
  address_text: string;
  latitude: number;
  longitude: number;
  is_available?: boolean;
}

export interface WorkshopUpdate {
  name?: string;
  address_text?: string;
  latitude?: number;
  longitude?: number;
  is_available?: bool;
}
