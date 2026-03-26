import { apiClient } from "@/core/api/client";
import type {
  FuelConsumptionFormValues,
  FuelConsumptionRecord,
  FuelFilters,
  FuelLookupOption,
  FuelStationFormValues,
  FuelStationRecord,
  FuelSummaryMetrics,
  FuelTransactionFormValues,
  FuelTransactionRecord,
} from "@/features/fuel/types/fuel";

function normalizeArrayResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "results" in payload &&
    Array.isArray((payload as { results?: unknown[] }).results)
  ) {
    return (payload as { results: T[] }).results;
  }

  return [];
}

export const fuelApi = {
  async fetchStations(filters: Pick<FuelFilters, "activeOnly" | "search">) {
    const response = await apiClient.get("/fuel/stations/", {
      params: {
        active_only: filters.activeOnly ? "true" : undefined,
        search: filters.search || undefined,
      },
    });
    return normalizeArrayResponse<FuelStationRecord>(response.data);
  },

  async createStation(values: FuelStationFormValues) {
    const response = await apiClient.post<FuelStationRecord>("/fuel/stations/", values);
    return response.data;
  },

  async fetchTransactions(filters: Pick<FuelFilters, "activeOnly">) {
    const response = await apiClient.get("/fuel/", {
      params: {
        active_only: filters.activeOnly ? "true" : undefined,
      },
    });
    return normalizeArrayResponse<FuelTransactionRecord>(response.data);
  },

  async createTransaction(values: FuelTransactionFormValues) {
    const response = await apiClient.post<FuelTransactionRecord>("/fuel/", {
      ...values,
      driver_id: values.driver_id ? Number(values.driver_id) : null,
      litres: values.litres || "0.00",
      odometer_reading: values.odometer_reading || "0.00",
      station_id: Number(values.station_id),
      trip_id: values.trip_id ? Number(values.trip_id) : null,
      unit_price: values.unit_price || "0.00",
      vehicle_id: Number(values.vehicle_id),
    });
    return response.data;
  },

  async fetchConsumption(filters: Pick<FuelFilters, "activeOnly">) {
    const response = await apiClient.get("/fuel/consumptions/", {
      params: {
        active_only: filters.activeOnly ? "true" : undefined,
      },
    });
    return normalizeArrayResponse<FuelConsumptionRecord>(response.data);
  },

  async createConsumption(values: FuelConsumptionFormValues) {
    const response = await apiClient.post<FuelConsumptionRecord>("/fuel/consumptions/", {
      ...values,
      closing_odometer: values.closing_odometer || "0.00",
      opening_odometer: values.opening_odometer || "0.00",
      total_cost: values.total_cost || "0.00",
      total_litres: values.total_litres || "0.00",
      vehicle_id: Number(values.vehicle_id),
    });
    return response.data;
  },

  async fetchLookups() {
    const [vehiclesResponse, driversResponse, tripsResponse, stationsResponse] = await Promise.all([
      apiClient.get("/vehicles/", { params: { active_only: "true" } }),
      apiClient.get("/drivers/", { params: { active_only: "true" } }),
      apiClient.get("/trips/", { params: { active_only: "true" } }),
      apiClient.get("/fuel/stations/", { params: { active_only: "true" } }),
    ]);

    return {
      drivers: normalizeArrayResponse<Record<string, unknown>>(driversResponse.data).map((driver) => ({
        id: Number(driver.id),
        label: String(
          driver.full_name ||
            `${driver.first_name || ""} ${driver.last_name || ""}`.trim() ||
            `Driver ${driver.id}`
        ),
        subtitle: String(driver.employee_id || driver.phone_number || ""),
      })) satisfies FuelLookupOption[],
      stations: normalizeArrayResponse<Record<string, unknown>>(stationsResponse.data).map(
        (station) => ({
          id: Number(station.id),
          label: String(station.name || `Station ${station.id}`),
          subtitle: String(station.location || station.station_type || ""),
        })
      ) satisfies FuelLookupOption[],
      trips: normalizeArrayResponse<Record<string, unknown>>(tripsResponse.data).map((trip) => ({
        id: Number(trip.id),
        label: String(trip.trip_number || `Trip ${trip.id}`),
        subtitle: String(trip.destination || trip.delivery_note_number || ""),
      })) satisfies FuelLookupOption[],
      vehicles: normalizeArrayResponse<Record<string, unknown>>(vehiclesResponse.data).map(
        (vehicle) => ({
          id: Number(vehicle.id),
          label: String(vehicle.registration_number || `Vehicle ${vehicle.id}`),
          subtitle: String(vehicle.fleet_number || vehicle.make || ""),
        })
      ) satisfies FuelLookupOption[],
    };
  },
};

export function createInitialFuelStationFormValues(): FuelStationFormValues {
  return {
    code: "",
    contact_person: "",
    contact_phone: "",
    is_active: true,
    location: "",
    name: "",
    station_type: "internal",
  };
}

export function createInitialFuelTransactionFormValues(): FuelTransactionFormValues {
  return {
    driver_id: "",
    full_tank: false,
    fuel_type: "diesel",
    is_active: true,
    litres: "",
    notes: "",
    odometer_reading: "",
    payment_method: "cash",
    reference_no: "",
    station_id: "",
    transaction_date: new Date().toISOString().slice(0, 10),
    trip_id: "",
    unit_price: "",
    vehicle_id: "",
  };
}

export function createInitialFuelConsumptionFormValues(): FuelConsumptionFormValues {
  return {
    closing_odometer: "",
    is_active: true,
    notes: "",
    opening_odometer: "",
    period_end: new Date().toISOString().slice(0, 10),
    period_start: new Date().toISOString().slice(0, 10),
    total_cost: "",
    total_litres: "",
    vehicle_id: "",
  };
}

export function buildFuelSummaryMetrics(input: {
  consumptions: FuelConsumptionRecord[];
  stations: FuelStationRecord[];
  transactions: FuelTransactionRecord[];
}): FuelSummaryMetrics {
  const averageKmPerLitre =
    input.consumptions.length > 0
      ? input.consumptions.reduce(
          (sum, item) => sum + Number(item.km_per_litre || 0),
          0
        ) / input.consumptions.length
      : 0;

  return {
    activeStations: input.stations.filter((item) => item.is_active).length,
    averageKmPerLitre,
    fullTankTransactions: input.transactions.filter((item) => item.full_tank).length,
    fuelVolume: input.transactions.reduce((sum, item) => sum + Number(item.litres || 0), 0),
    totalFuelSpend: input.transactions.reduce(
      (sum, item) => sum + Number(item.total_cost || 0),
      0
    ),
    trackedConsumptionPeriods: input.consumptions.filter((item) => item.is_active).length,
  };
}
