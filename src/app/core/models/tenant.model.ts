export interface Tenant {
  id: number;
  name: string;
  tax_id?: string;
  subdomain?: string;
  is_active: boolean;
}

export interface TenantRegistrationRequest {
  tenant_name: string;
  tax_id?: string;
  admin_full_name: string;
  admin_email: string;
  admin_password: string;
}

export interface TenantUpdate {
  name?: string;
  tax_id?: string;
  subdomain?: string;
  is_active?: boolean;
}
