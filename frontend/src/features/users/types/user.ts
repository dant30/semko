// frontend/src/features/users/types/user.ts
export interface RoleRecord {
  id: number;
  name: string;
  code: string;
  description?: string;
  permissions?: string[];
}

export interface UserRecord {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  role?: RoleRecord | null;
  is_active: boolean;
  is_staff: boolean;
  must_change_password: boolean;
  date_joined: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFilters {
  activeOnly: boolean;
  search: string;
}

export interface UserSummaryMetrics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  staffUsers: number;
}

export interface UserFormValues {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role_id: number | "";
  password: string;
  password_confirm: string;
  is_active: boolean;
  is_staff: boolean;
  must_change_password: boolean;
}
