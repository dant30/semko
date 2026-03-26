export type VehicleView = "fleet" | "types" | "ownerships";
export type VehicleStatus = "active" | "inactive" | "maintenance" | "retired";
export type OwnershipType = "company" | "leased" | "contracted" | "hired" | "other";

export interface VehicleTypeRecord {
  id: number;
  name: string;
  code: string;
  description: string;
  default_capacity_tonnes: string;
  axle_count: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleOwnershipRecord {
  id: number;
  name: string;
  ownership_type: OwnershipType;
  contact_person: string;
  phone_number: string;
  email: string;
  contract_reference: string;
  effective_from: string | null;
  effective_to: string | null;
  notes: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleRecord {
  id: number;
  registration_number: string;
  fleet_number: string;
  vehicle_type: VehicleTypeRecord;
  ownership: VehicleOwnershipRecord;
  make: string;
  model: string;
  year: number;
  chassis_number: string;
  engine_number: string;
  color: string;
  capacity_tonnes: string;
  status: VehicleStatus;
  insurance_expiry: string | null;
  inspection_expiry: string | null;
  notes: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleLookupOption {
  id: number;
  label: string;
  subtitle?: string;
}

export interface VehiclesFilters {
  activeOnly: boolean;
  ownershipType: "" | OwnershipType;
  search: string;
  status: "" | VehicleStatus;
  view: VehicleView;
}

export interface VehicleSummaryMetrics {
  activeVehicles: number;
  insuranceDueSoon: number;
  internalOwnerships: number;
  maintenanceVehicles: number;
  ownershipRecords: number;
  vehicleTypes: number;
}

export interface VehicleTypeFormValues {
  axle_count: string;
  code: string;
  default_capacity_tonnes: string;
  description: string;
  is_active: boolean;
  name: string;
}

export interface VehicleOwnershipFormValues {
  contact_person: string;
  contract_reference: string;
  effective_from: string;
  effective_to: string;
  email: string;
  is_active: boolean;
  name: string;
  notes: string;
  ownership_type: OwnershipType;
  phone_number: string;
}

export interface VehicleFormValues {
  capacity_tonnes: string;
  chassis_number: string;
  color: string;
  engine_number: string;
  fleet_number: string;
  inspection_expiry: string;
  insurance_expiry: string;
  is_active: boolean;
  make: string;
  model: string;
  notes: string;
  ownership_id: string;
  registration_number: string;
  status: VehicleStatus;
  vehicle_type_id: string;
  year: string;
}
