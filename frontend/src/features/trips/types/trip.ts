export type TripStatus = "draft" | "in_progress" | "delivered" | "cancelled";
export type TripType = "owned" | "hired";

export interface TripWeighbridgeReading {
  id: number;
  quarry_gross_weight?: string;
  quarry_net_weight?: string;
  quarry_tare_weight?: string;
  site_gross_weight?: string;
  site_net_weight?: string;
  site_tare_weight?: string;
}

export interface TripDiscrepancy {
  id: number;
  weight_difference?: string;
  percentage_difference?: string;
  tolerance_percentage?: string;
  penalty_amount?: string;
  within_tolerance?: boolean;
  notes?: string;
}

export interface TripCessTransaction {
  id: number;
  county?: string;
  quantity?: string;
  amount?: string;
  status?: string;
  notes?: string;
}

export interface TripHiredTrip {
  id: number;
  notes?: string;
  owner_name?: string;
  owner_rate_per_trip?: string;
  owner_total_amount?: string;
  settlement_status?: string;
}

export interface TripRecord {
  id: number;
  trip_number: string;
  delivery_note_number: string;
  delivery_note_document?: string | null;
  trip_date: string;
  dispatch_time?: string | null;
  arrival_time?: string | null;
  vehicle: number;
  driver: number;
  client: number;
  quarry: number;
  material: number;
  destination: string;
  classification_label?: string;
  trip_type: TripType;
  quantity_unit?: string;
  expected_quantity: string;
  agreed_unit_price: string;
  status: TripStatus;
  remarks?: string;
  documents_verified: boolean;
  is_active: boolean;
  weighbridge_reading?: TripWeighbridgeReading | null;
  discrepancy?: TripDiscrepancy | null;
  hired_trip?: TripHiredTrip | null;
  cess_transaction?: TripCessTransaction | null;
  created_at?: string;
  updated_at?: string;
}

export interface TripSummaryRecord {
  id: number;
  trip_number: string;
  trip_date: string;
  classification_label?: string;
  status: TripStatus;
  trip_type: TripType;
  client: number;
  vehicle: number;
  driver: number;
  material: number;
  destination: string;
  expected_quantity: string;
  agreed_unit_price: string;
  net_weight: string;
  penalty_amount: string;
  cess_amount: string;
  documents_verified: boolean;
}

export type TripWorkflowAction = "dispatch" | "confirm_delivery" | "verify_documents";

export interface TripsOperationsSummary {
  total_trips: number;
  delivered_trips: number;
  in_progress_trips: number;
  cancelled_trips: number;
  documents_verified: number;
  total_expected_quantity: string;
  total_cess_amount: string;
  total_penalty_amount: string;
}

export interface TripFilters {
  search: string;
  status: "" | TripStatus;
  tripType: "" | TripType;
  activeOnly: boolean;
}

export interface TripLookupOption {
  id: number;
  label: string;
  parentId?: number;
  subtitle?: string;
}

export interface TripFormValues {
  agreed_unit_price: string;
  client_id: string;
  cess_notes: string;
  cess_status: string;
  delivery_note_number: string;
  delivery_note_file: File | null;
  delivery_note_file_name: string;
  destination: string;
  discrepancy_notes: string;
  discrepancy_tolerance_percentage: string;
  documents_verified: boolean;
  driver_id: string;
  expected_quantity: string;
  hired_owner_name: string;
  hired_owner_rate_per_trip: string;
  hired_settlement_status: string;
  hired_trip_notes: string;
  is_active: boolean;
  material_id: string;
  quarry_id: string;
  quarry_gross_weight: string;
  quarry_tare_weight: string;
  quantity_unit: string;
  remarks: string;
  site_gross_weight: string;
  site_tare_weight: string;
  status: TripStatus;
  trip_date: string;
  trip_number: string;
  trip_type: TripType;
  vehicle_id: string;
}
