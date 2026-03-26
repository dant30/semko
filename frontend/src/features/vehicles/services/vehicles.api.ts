import { apiClient } from "@/core/api/client";
import type {
  OwnershipType,
  VehicleFormValues,
  VehicleOwnershipFormValues,
  VehicleOwnershipRecord,
  VehiclesFilters,
  VehicleRecord,
  VehicleSummaryMetrics,
  VehicleTypeFormValues,
  VehicleTypeRecord,
} from "@/features/vehicles/types/vehicle";

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

export const vehiclesApi = {
  async fetchVehicles(
    filters: Pick<VehiclesFilters, "activeOnly" | "ownershipType" | "search" | "status">
  ) {
    const response = await apiClient.get("/vehicles/", {
      params: {
        active_only: filters.activeOnly ? "true" : undefined,
        ownership_type: filters.ownershipType || undefined,
        search: filters.search || undefined,
        status: filters.status || undefined,
      },
    });

    return normalizeArrayResponse<VehicleRecord>(response.data);
  },

  async fetchTypes() {
    const response = await apiClient.get("/vehicles/types/", {
      params: { active_only: "true" },
    });
    return normalizeArrayResponse<VehicleTypeRecord>(response.data);
  },

  async fetchOwnerships(ownershipType?: "" | OwnershipType) {
    const response = await apiClient.get("/vehicles/ownerships/", {
      params: {
        active_only: "true",
        ownership_type: ownershipType || undefined,
      },
    });
    return normalizeArrayResponse<VehicleOwnershipRecord>(response.data);
  },

  async createType(values: VehicleTypeFormValues) {
    const response = await apiClient.post<VehicleTypeRecord>("/vehicles/types/", {
      ...values,
      axle_count: Number(values.axle_count || 0),
      default_capacity_tonnes: values.default_capacity_tonnes || "0.00",
    });
    return response.data;
  },

  async createOwnership(values: VehicleOwnershipFormValues) {
    const response = await apiClient.post<VehicleOwnershipRecord>("/vehicles/ownerships/", {
      ...values,
      effective_from: values.effective_from || null,
      effective_to: values.effective_to || null,
    });
    return response.data;
  },

  async createVehicle(values: VehicleFormValues) {
    const response = await apiClient.post<VehicleRecord>("/vehicles/", {
      ...values,
      ownership_id: Number(values.ownership_id),
      vehicle_type_id: Number(values.vehicle_type_id),
      year: Number(values.year),
      capacity_tonnes: values.capacity_tonnes || "0.00",
      insurance_expiry: values.insurance_expiry || null,
      inspection_expiry: values.inspection_expiry || null,
    });
    return response.data;
  },
};

export function createInitialVehicleTypeFormValues(): VehicleTypeFormValues {
  return {
    axle_count: "",
    code: "",
    default_capacity_tonnes: "",
    description: "",
    is_active: true,
    name: "",
  };
}

export function createInitialVehicleOwnershipFormValues(): VehicleOwnershipFormValues {
  return {
    contact_person: "",
    contract_reference: "",
    effective_from: "",
    effective_to: "",
    email: "",
    is_active: true,
    name: "",
    notes: "",
    ownership_type: "company",
    phone_number: "",
  };
}

export function createInitialVehicleFormValues(): VehicleFormValues {
  return {
    capacity_tonnes: "",
    chassis_number: "",
    color: "",
    engine_number: "",
    fleet_number: "",
    inspection_expiry: "",
    insurance_expiry: "",
    is_active: true,
    make: "",
    model: "",
    notes: "",
    ownership_id: "",
    registration_number: "",
    status: "active",
    vehicle_type_id: "",
    year: "",
  };
}

export function buildVehicleSummaryMetrics(input: {
  ownerships: VehicleOwnershipRecord[];
  types: VehicleTypeRecord[];
  vehicles: VehicleRecord[];
}): VehicleSummaryMetrics {
  const today = new Date();
  const dueBoundary = new Date();
  dueBoundary.setDate(today.getDate() + 30);

  return {
    activeVehicles: input.vehicles.filter((vehicle) => vehicle.is_active).length,
    insuranceDueSoon: input.vehicles.filter((vehicle) => {
      if (!vehicle.insurance_expiry) {
        return false;
      }

      const expiry = new Date(vehicle.insurance_expiry);
      return expiry >= today && expiry <= dueBoundary;
    }).length,
    internalOwnerships: input.ownerships.filter((item) => item.ownership_type === "company")
      .length,
    maintenanceVehicles: input.vehicles.filter((vehicle) => vehicle.status === "maintenance")
      .length,
    ownershipRecords: input.ownerships.length,
    vehicleTypes: input.types.length,
  };
}
