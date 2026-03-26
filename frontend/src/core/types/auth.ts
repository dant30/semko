export interface AuthRole {
  id?: number;
  name?: string;
  code?: string;
  permissions?: string[];
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  effective_permissions?: string[];
  is_superuser?: boolean;
  role?: AuthRole | null;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: AuthUser;
}
