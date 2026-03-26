import { apiClient } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";
import type {
  TripFilters,
  TripFormValues,
  TripLookupOption,
  TripRecord,
  TripSummaryRecord,
  TripWorkflowAction,
  TripsOperationsSummary,
} from "@/features/trips/types/trip";

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

export const tripsApi = {
  async fetchTrips(filters: TripFilters) {
    const response = await apiClient.get(endpoints.trips.list, {
      params: {
        active_only: filters.activeOnly ? "true" : undefined,
        search: filters.search || undefined,
        status: filters.status || undefined,
        trip_type: filters.tripType || undefined,
      },
    });

    return normalizeArrayResponse<TripRecord>(response.data);
  },

  async fetchOperationsSummary(activeOnly = true) {
    const response = await apiClient.get<TripsOperationsSummary>(endpoints.trips.summary, {
      params: {
        active_only: activeOnly ? "true" : undefined,
      },
    });

    return response.data;
  },

  async fetchTripSummary(tripId: number) {
    const response = await apiClient.get<TripSummaryRecord>(
      endpoints.trips.detailSummary(tripId)
    );

    return response.data;
  },

  async fetchTripDetail(tripId: number) {
    const response = await apiClient.get<TripRecord>(`${endpoints.trips.list}${tripId}/`);
    return response.data;
  },

  async createTrip(payload: Record<string, unknown>) {
    const response = await apiClient.post<TripRecord>(endpoints.trips.list, payload);
    return response.data;
  },

  async updateTrip(tripId: number, payload: Record<string, unknown>) {
    const response = await apiClient.patch<TripRecord>(
      `${endpoints.trips.list}${tripId}/`,
      payload
    );
    return response.data;
  },

  async updateTripDocuments(tripId: number, payload: { deliveryNoteFile?: File | null; documentsVerified: boolean }) {
    const formData = new FormData();
    formData.append("documents_verified", payload.documentsVerified ? "true" : "false");
    if (payload.deliveryNoteFile) {
      formData.append("delivery_note_document", payload.deliveryNoteFile);
    }

    const response = await apiClient.patch(
      `${endpoints.trips.list}${tripId}/documents/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  async runWorkflowAction(tripId: number, action: TripWorkflowAction) {
    switch (action) {
      case "dispatch":
        return this.updateTrip(tripId, { status: "in_progress" });
      case "confirm_delivery":
        return this.updateTrip(tripId, { status: "delivered" });
      case "verify_documents":
        return this.updateTripDocuments(tripId, {
          deliveryNoteFile: null,
          documentsVerified: true,
        });
      default:
        throw new Error(`Unsupported trip workflow action: ${String(action)}`);
    }
  },

  async fetchTripLookups() {
    const [vehiclesResponse, driversResponse, clientsResponse, quarriesResponse, materialsResponse] =
      await Promise.all([
        apiClient.get("/vehicles/", { params: { active_only: "true" } }),
        apiClient.get("/drivers/", { params: { active_only: "true" } }),
        apiClient.get("/clients/", { params: { active_only: "true" } }),
        apiClient.get("/clients/quarries/", { params: { active_only: "true" } }),
        apiClient.get("/materials/", { params: { active_only: "true" } }),
      ]);

    return {
      clients: normalizeArrayResponse<Record<string, unknown>>(clientsResponse.data).map(
        (client) => ({
          id: Number(client.id),
          label: String(client.name || `Client ${client.id}`),
          subtitle: String(client.code || client.county || ""),
        })
      ) satisfies TripLookupOption[],
      drivers: normalizeArrayResponse<Record<string, unknown>>(driversResponse.data).map(
        (driver) => ({
          id: Number(driver.id),
          label: String(driver.full_name || `${driver.first_name || ""} ${driver.last_name || ""}`.trim() || `Driver ${driver.id}`),
          subtitle: String(driver.employee_id || driver.phone_number || ""),
        })
      ) satisfies TripLookupOption[],
      materials: normalizeArrayResponse<Record<string, unknown>>(materialsResponse.data).map(
        (material) => ({
          id: Number(material.id),
          label: String(material.name || `Material ${material.id}`),
          subtitle: String(material.unit_of_measure || material.category || ""),
        })
      ) satisfies TripLookupOption[],
      quarries: normalizeArrayResponse<Record<string, unknown>>(quarriesResponse.data).map(
        (quarry) => ({
          id: Number(quarry.id),
          label: String(quarry.name || `Quarry ${quarry.id}`),
          parentId: quarry.client_id ? Number(quarry.client_id) : undefined,
          subtitle: String(quarry.client_name || quarry.county || ""),
        })
      ) satisfies TripLookupOption[],
      vehicles: normalizeArrayResponse<Record<string, unknown>>(vehiclesResponse.data).map(
        (vehicle) => ({
          id: Number(vehicle.id),
          label: String(vehicle.registration_number || `Vehicle ${vehicle.id}`),
          subtitle: String(vehicle.fleet_number || vehicle.make || ""),
        })
      ) satisfies TripLookupOption[],
    };
  },
};

export function createInitialTripFormValues(): TripFormValues {
  return {
    agreed_unit_price: "",
    client_id: "",
    cess_notes: "",
    cess_status: "pending",
    delivery_note_number: "",
    delivery_note_file: null,
    delivery_note_file_name: "",
    destination: "",
    discrepancy_notes: "",
    discrepancy_tolerance_percentage: "2.50",
    documents_verified: false,
    driver_id: "",
    expected_quantity: "",
    hired_owner_name: "",
    hired_owner_rate_per_trip: "",
    hired_settlement_status: "pending",
    hired_trip_notes: "",
    is_active: true,
    material_id: "",
    quarry_id: "",
    quarry_gross_weight: "",
    quarry_tare_weight: "",
    quantity_unit: "tonnes",
    remarks: "",
    site_gross_weight: "",
    site_tare_weight: "",
    status: "draft",
    trip_date: new Date().toISOString().slice(0, 10),
    trip_number: "",
    trip_type: "owned",
    vehicle_id: "",
  };
}

export function mapTripRecordToFormValues(trip: TripRecord): TripFormValues {
  return {
    agreed_unit_price: trip.agreed_unit_price || "",
    client_id: String(trip.client || ""),
    cess_notes: trip.cess_transaction?.notes || "",
    cess_status: trip.cess_transaction?.status || "pending",
    delivery_note_number: trip.delivery_note_number || "",
    delivery_note_file: null,
    delivery_note_file_name:
      typeof trip.delivery_note_document === "string"
        ? trip.delivery_note_document.split("/").pop() || ""
        : "",
    destination: trip.destination || "",
    discrepancy_notes: trip.discrepancy?.notes || "",
    discrepancy_tolerance_percentage: trip.discrepancy?.tolerance_percentage || "2.50",
    documents_verified: Boolean(trip.documents_verified),
    driver_id: String(trip.driver || ""),
    expected_quantity: trip.expected_quantity || "",
    hired_owner_name: trip.hired_trip?.owner_name || "",
    hired_owner_rate_per_trip: trip.hired_trip?.owner_rate_per_trip || "",
    hired_settlement_status: trip.hired_trip?.settlement_status || "pending",
    hired_trip_notes: trip.hired_trip?.notes || "",
    is_active: Boolean(trip.is_active),
    material_id: String(trip.material || ""),
    quarry_id: String(trip.quarry || ""),
    quarry_gross_weight: trip.weighbridge_reading?.quarry_gross_weight || "",
    quarry_tare_weight: trip.weighbridge_reading?.quarry_tare_weight || "",
    quantity_unit: trip.quantity_unit || "tonnes",
    remarks: trip.remarks || "",
    site_gross_weight: trip.weighbridge_reading?.site_gross_weight || "",
    site_tare_weight: trip.weighbridge_reading?.site_tare_weight || "",
    status: trip.status,
    trip_date: trip.trip_date,
    trip_number: trip.trip_number || "",
    trip_type: trip.trip_type,
    vehicle_id: String(trip.vehicle || ""),
  };
}

export function mapFormValuesToTripPayload(values: TripFormValues) {
  const payload: Record<string, unknown> = {
    agreed_unit_price: values.agreed_unit_price || "0.00",
    client_id: Number(values.client_id),
    delivery_note_number: values.delivery_note_number.trim(),
    destination: values.destination.trim(),
    documents_verified: values.documents_verified,
    driver_id: Number(values.driver_id),
    expected_quantity: values.expected_quantity || "0.00",
    is_active: values.is_active,
    material_id: Number(values.material_id),
    quarry_id: Number(values.quarry_id),
    quantity_unit: values.quantity_unit.trim(),
    remarks: values.remarks.trim(),
    status: values.status,
    trip_date: values.trip_date,
    trip_number: values.trip_number.trim(),
    trip_type: values.trip_type,
    vehicle_id: Number(values.vehicle_id),
  };

  if (
    values.quarry_gross_weight &&
    values.quarry_tare_weight &&
    values.site_gross_weight &&
    values.site_tare_weight
  ) {
    payload.weighbridge_reading = {
      quarry_gross_weight: values.quarry_gross_weight,
      quarry_tare_weight: values.quarry_tare_weight,
      site_gross_weight: values.site_gross_weight,
      site_tare_weight: values.site_tare_weight,
    };
  }

  if (values.discrepancy_tolerance_percentage || values.discrepancy_notes) {
    payload.discrepancy = {
      notes: values.discrepancy_notes.trim(),
      tolerance_percentage: values.discrepancy_tolerance_percentage || "2.50",
    };
  }

  if (values.trip_type === "hired" && values.hired_owner_name && values.hired_owner_rate_per_trip) {
    payload.hired_trip = {
      notes: values.hired_trip_notes.trim(),
      owner_name: values.hired_owner_name.trim(),
      owner_rate_per_trip: values.hired_owner_rate_per_trip || "0.00",
      settlement_status: values.hired_settlement_status || "pending",
    };
  }

  if (values.cess_notes || values.cess_status) {
    payload.cess_transaction = {
      notes: values.cess_notes.trim(),
      status: values.cess_status || "pending",
    };
  }

  return payload;
}
