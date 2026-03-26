export interface Option {
  label: string;
  value: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  requiredPermissions?: string[];
  children?: NavItem[];
}
