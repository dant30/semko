export type DriverView = "register" | "licenses";
export type DriverEmploymentStatus =
  | "active"
  | "on_leave"
  | "suspended"
  | "inactive"
  | "terminated";
export type DriverLicenseStatus = "valid" | "expired" | "suspended" | "revoked";

export interface DriverLicenseRecord {
  id: number;
  license_number: string;
  license_class: string;
  issue_date: string;
  expiry_date: string;
  status: DriverLicenseStatus;
  issuing_authority: string;
  restrictions: string;
  notes: string;
  is_expired: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DriverRecord {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  national_id: string;
  phone_number: string;
  alternate_phone_number: string;
  email: string;
  date_of_birth: string;
  hire_date: string;
  employment_status: DriverEmploymentStatus;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  address: string;
  notes: string;
  is_active: boolean;
  license: DriverLicenseRecord | null;
  created_at?: string;
  updated_at?: string;
}

export interface DriversFilters {
  activeOnly: boolean;
  employmentStatus: "" | DriverEmploymentStatus;
  licenseStatus: "" | DriverLicenseStatus;
  search: string;
  view: DriverView;
}

export interface DriversSummaryMetrics {
  activeDrivers: number;
  expiringSoon: number;
  onLeaveDrivers: number;
  suspendedDrivers: number;
  validLicenses: number;
  withExpiredLicenses: number;
}

export interface DriverFormValues {
  address: string;
  alternate_phone_number: string;
  date_of_birth: string;
  email: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  employee_id: string;
  employment_status: DriverEmploymentStatus;
  first_name: string;
  hire_date: string;
  is_active: boolean;
  last_name: string;
  national_id: string;
  notes: string;
  phone_number: string;
  license: {
    expiry_date: string;
    issue_date: string;
    issuing_authority: string;
    license_class: string;
    license_number: string;
    notes: string;
    restrictions: string;
    status: DriverLicenseStatus;
  };
}
