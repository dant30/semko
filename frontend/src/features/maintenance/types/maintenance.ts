export type MaintenanceView = "schedules" | "mechanics" | "service-records" | "parts-used";
export type MechanicEmploymentType = "internal" | "external" | "contract";
export type MaintenanceType =
  | "preventive"
  | "corrective"
  | "inspection"
  | "tyre"
  | "engine"
  | "other";
export type ScheduleStatus = "scheduled" | "due" | "overdue" | "completed" | "cancelled";
export type ServiceStatus = "open" | "in_progress" | "completed" | "cancelled";

export interface MechanicRecord {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  specialization: string;
  employment_type: MechanicEmploymentType;
  notes: string;
  is_active: boolean;
}

export interface MaintenanceScheduleRecord {
  id: number;
  vehicle: number;
  vehicle_registration: string;
  reference_no: string;
  title: string;
  maintenance_type: MaintenanceType;
  interval_days: number | null;
  interval_km: number | null;
  last_service_date: string | null;
  last_service_odometer: string | null;
  next_due_date: string | null;
  next_due_odometer: string | null;
  current_odometer: string | null;
  status: ScheduleStatus;
  due_state: string;
  notes: string;
  is_active: boolean;
}

export interface PartUsedRecord {
  id: number;
  service_record: number;
  item: number;
  item_name: string;
  quantity: string;
  unit_cost: string;
  total_cost: string;
  notes: string;
  is_active: boolean;
}

export interface ServiceRecordRecord {
  id: number;
  vehicle: number;
  vehicle_registration: string;
  schedule: number | null;
  schedule_reference: string;
  mechanic: number;
  mechanic_name: string;
  reference_no: string;
  title: string;
  service_date: string;
  odometer_reading: string;
  labor_cost: string;
  external_cost: string;
  total_parts_cost: string;
  total_cost: string;
  status: ServiceStatus;
  diagnosis: string;
  work_performed: string;
  notes: string;
  is_active: boolean;
  parts_used: PartUsedRecord[];
}

export interface MaintenanceLookupOption {
  id: number;
  label: string;
  subtitle?: string;
}

export interface MaintenanceFilters {
  activeOnly: boolean;
  search: string;
  view: MaintenanceView;
}

export interface MaintenanceSummaryMetrics {
  activeMechanics: number;
  dueSchedules: number;
  overdueSchedules: number;
  openServices: number;
  completedServices: number;
  totalServiceCost: number;
}

export interface MechanicFormValues {
  email: string;
  employee_id: string;
  employment_type: MechanicEmploymentType;
  first_name: string;
  is_active: boolean;
  last_name: string;
  notes: string;
  phone_number: string;
  specialization: string;
}

export interface MaintenanceScheduleFormValues {
  current_odometer: string;
  interval_days: string;
  interval_km: string;
  is_active: boolean;
  last_service_date: string;
  last_service_odometer: string;
  maintenance_type: MaintenanceType;
  notes: string;
  reference_no: string;
  status: ScheduleStatus;
  title: string;
  vehicle_id: string;
}

export interface ServiceRecordFormValues {
  diagnosis: string;
  external_cost: string;
  is_active: boolean;
  labor_cost: string;
  mechanic_id: string;
  notes: string;
  odometer_reading: string;
  reference_no: string;
  schedule_id: string;
  service_date: string;
  status: ServiceStatus;
  title: string;
  vehicle_id: string;
  work_performed: string;
}

export interface PartUsedFormValues {
  is_active: boolean;
  item_id: string;
  notes: string;
  quantity: string;
  service_record_id: string;
  unit_cost: string;
}
