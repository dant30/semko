export interface RoleRecord {
  id: number;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  is_system?: boolean;
}

export interface RoleFilters {
  search: string;
}

export interface RoleFormValues {
  name: string;
  code: string;
  description: string;
  permissions: string;
}
