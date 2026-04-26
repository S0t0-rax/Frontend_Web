export type IncidentStatus = 'open' | 'assigned' | 'resolved' | 'cancelled' | 'in_progress' | 'rejected';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical' | 'unknown';

export interface IncidentPhoto {
  id: number;
  storage_url: string;
  ai_detected_issue?: string;
  ai_confidence_score?: number;
  ai_metadata?: any;
  created_at: string;
}

export interface Incident {
  id: number;
  client_id?: number;
  car_id?: number;
  address_reference?: string;
  description?: string;
  severity_level: SeverityLevel;
  status: IncidentStatus;
  reported_at: string;
  latitude: number;
  longitude: number;
  photos: IncidentPhoto[];
}

export interface IncidentUpdate {
  description?: string;
  severity_level?: SeverityLevel;
  status?: IncidentStatus;
  address_reference?: string;
  mechanic_ids?: number[];
  workshop_id?: number;
}
