export type FuelView = "transactions" | "stations" | "consumption";
export type FuelStationType = "internal" | "external";
export type FuelType = "diesel" | "petrol" | "kerosene" | "other";
export type FuelPaymentMethod = "cash" | "credit" | "fuel_card" | "voucher" | "internal";

export interface FuelStationRecord {
  id: number;
  name: string;
  code: string;
  station_type: FuelStationType;
  location: string;
  contact_person: string;
  contact_phone: string;
  is_active: boolean;
}

export interface FuelTransactionRecord {
  id: number;
  reference_no: string;
  transaction_date: string;
  vehicle: number;
  vehicle_registration: string;
  driver: number | null;
  driver_name: string;
  trip: number | null;
  trip_number: string;
  station: number;
  station_name: string;
  fuel_type: FuelType;
  litres: string;
  unit_price: string;
  total_cost: string;
  odometer_reading: string;
  full_tank: boolean;
  payment_method: FuelPaymentMethod;
  notes: string;
  is_active: boolean;
}

export interface FuelConsumptionRecord {
  id: number;
  vehicle: number;
  vehicle_registration: string;
  period_start: string;
  period_end: string;
  opening_odometer: string;
  closing_odometer: string;
  total_litres: string;
  total_cost: string;
  distance_covered: string;
  km_per_litre: string;
  litres_per_100km: string;
  notes: string;
  is_active: boolean;
}

export interface FuelLookupOption {
  id: number;
  label: string;
  subtitle?: string;
}

export interface FuelFilters {
  activeOnly: boolean;
  search: string;
  view: FuelView;
}

export interface FuelSummaryMetrics {
  activeStations: number;
  fuelVolume: number;
  totalFuelSpend: number;
  fullTankTransactions: number;
  trackedConsumptionPeriods: number;
  averageKmPerLitre: number;
}

export interface FuelStationFormValues {
  code: string;
  contact_person: string;
  contact_phone: string;
  is_active: boolean;
  location: string;
  name: string;
  station_type: FuelStationType;
}

export interface FuelTransactionFormValues {
  driver_id: string;
  full_tank: boolean;
  fuel_type: FuelType;
  is_active: boolean;
  litres: string;
  notes: string;
  odometer_reading: string;
  payment_method: FuelPaymentMethod;
  reference_no: string;
  station_id: string;
  transaction_date: string;
  trip_id: string;
  unit_price: string;
  vehicle_id: string;
}

export interface FuelConsumptionFormValues {
  closing_odometer: string;
  is_active: boolean;
  notes: string;
  opening_odometer: string;
  period_end: string;
  period_start: string;
  total_cost: string;
  total_litres: string;
  vehicle_id: string;
}
