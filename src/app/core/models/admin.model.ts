export interface UserAdminUpdate {
  full_name?: string;
  phone?: string;
  is_active?: boolean;
  role_name?: string;
}

export interface AuditLogResponse {
  id: number;
  user_id: number | null;
  action: string;
  entity: string;
  entity_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
  ip_address: string | null;
}

export interface IncidentGlobalResponse {
  id: number;
  client_id: number;
  car_id: number;
  address_reference: string;
  description: string;
  severity_level: string;
  status: string;
  reported_at: string;
  client_name: string;
  mechanic_name: string | null;
  workshop_name: string | null;
}

