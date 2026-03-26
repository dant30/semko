import { apiClient } from "@/core/api/client";
import type {
  MaintenanceFilters,
  MaintenanceLookupOption,
  MaintenanceScheduleFormValues,
  MaintenanceScheduleRecord,
  MaintenanceSummaryMetrics,
  MechanicFormValues,
  MechanicRecord,
  PartUsedFormValues,
  PartUsedRecord,
  ServiceRecordFormValues,
  ServiceRecordRecord,
} from "@/features/maintenance/types/maintenance";

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

export const maintenanceApi = {
  async fetchMechanics(filters: Pick<MaintenanceFilters, "activeOnly" | "search">) {
    const response = await apiClient.get("/maintenance/mechanics/", {
      params: {
        active_only: filters.activeOnly ? "true" : undefined,
        search: filters.search || undefined,
      },
    });
    return normalizeArrayResponse<MechanicRecord>(response.data);
  },

  async createMechanic(values: MechanicFormValues) {
    const response = await apiClient.post<MechanicRecord>("/maintenance/mechanics/", values);
    return response.data;
  },

  async fetchSchedules(filters: Pick<MaintenanceFilters, "activeOnly">) {
    const response = await apiClient.get("/maintenance/schedules/", {
      params: { active_only: filters.activeOnly ? "true" : undefined },
    });
    return normalizeArrayResponse<MaintenanceScheduleRecord>(response.data);
  },

  async createSchedule(values: MaintenanceScheduleFormValues) {
    const response = await apiClient.post<MaintenanceScheduleRecord>("/maintenance/schedules/", {
      ...values,
      current_odometer: values.current_odometer || null,
      interval_days: values.interval_days ? Number(values.interval_days) : null,
      interval_km: values.interval_km ? Number(values.interval_km) : null,
      last_service_date: values.last_service_date || null,
      last_service_odometer: values.last_service_odometer || null,
      vehicle_id: Number(values.vehicle_id),
    });
    return response.data;
  },

  async fetchServiceRecords(filters: Pick<MaintenanceFilters, "activeOnly">) {
    const response = await apiClient.get("/maintenance/service-records/", {
      params: { active_only: filters.activeOnly ? "true" : undefined },
    });
    return normalizeArrayResponse<ServiceRecordRecord>(response.data);
  },

  async createServiceRecord(values: ServiceRecordFormValues) {
    const response = await apiClient.post<ServiceRecordRecord>("/maintenance/service-records/", {
      ...values,
      external_cost: values.external_cost || "0.00",
      labor_cost: values.labor_cost || "0.00",
      mechanic_id: Number(values.mechanic_id),
      odometer_reading: values.odometer_reading || "0.00",
      schedule_id: values.schedule_id ? Number(values.schedule_id) : null,
      vehicle_id: Number(values.vehicle_id),
    });
    return response.data;
  },

  async fetchPartsUsed(filters: Pick<MaintenanceFilters, "activeOnly">) {
    const response = await apiClient.get("/maintenance/parts-used/", {
      params: { active_only: filters.activeOnly ? "true" : undefined },
    });
    return normalizeArrayResponse<PartUsedRecord>(response.data);
  },

  async createPartUsed(values: PartUsedFormValues) {
    const response = await apiClient.post<PartUsedRecord>("/maintenance/parts-used/", {
      ...values,
      item_id: Number(values.item_id),
      quantity: values.quantity || "0.00",
      service_record_id: Number(values.service_record_id),
      unit_cost: values.unit_cost || "0.00",
    });
    return response.data;
  },

  async fetchLookups() {
    const [vehiclesResponse, mechanicsResponse, schedulesResponse, servicesResponse, itemsResponse] =
      await Promise.all([
        apiClient.get("/vehicles/", { params: { active_only: "true" } }),
        apiClient.get("/maintenance/mechanics/", { params: { active_only: "true" } }),
        apiClient.get("/maintenance/schedules/", { params: { active_only: "true" } }),
        apiClient.get("/maintenance/service-records/", { params: { active_only: "true" } }),
        apiClient.get("/stores/", { params: { active_only: "true" } }),
      ]);

    return {
      items: normalizeArrayResponse<Record<string, unknown>>(itemsResponse.data).map((item) => ({
        id: Number(item.id),
        label: String(item.name || `Item ${item.id}`),
        subtitle: String(item.code || item.stock_on_hand || ""),
      })) satisfies MaintenanceLookupOption[],
      mechanics: normalizeArrayResponse<Record<string, unknown>>(mechanicsResponse.data).map(
        (mechanic) => ({
          id: Number(mechanic.id),
          label: `${String(mechanic.first_name || "")} ${String(mechanic.last_name || "")}`.trim(),
          subtitle: String(mechanic.employee_id || mechanic.specialization || ""),
        })
      ) satisfies MaintenanceLookupOption[],
      schedules: normalizeArrayResponse<Record<string, unknown>>(schedulesResponse.data).map(
        (schedule) => ({
          id: Number(schedule.id),
          label: String(schedule.reference_no || `Schedule ${schedule.id}`),
          subtitle: String(schedule.vehicle_registration || schedule.title || ""),
        })
      ) satisfies MaintenanceLookupOption[],
      serviceRecords: normalizeArrayResponse<Record<string, unknown>>(servicesResponse.data).map(
        (record) => ({
          id: Number(record.id),
          label: String(record.reference_no || `Service ${record.id}`),
          subtitle: String(record.vehicle_registration || record.title || ""),
        })
      ) satisfies MaintenanceLookupOption[],
      vehicles: normalizeArrayResponse<Record<string, unknown>>(vehiclesResponse.data).map(
        (vehicle) => ({
          id: Number(vehicle.id),
          label: String(vehicle.registration_number || `Vehicle ${vehicle.id}`),
          subtitle: String(vehicle.fleet_number || vehicle.make || ""),
        })
      ) satisfies MaintenanceLookupOption[],
    };
  },
};

export function createInitialMechanicFormValues(): MechanicFormValues {
  return {
    email: "",
    employee_id: "",
    employment_type: "internal",
    first_name: "",
    is_active: true,
    last_name: "",
    notes: "",
    phone_number: "",
    specialization: "",
  };
}

export function createInitialScheduleFormValues(): MaintenanceScheduleFormValues {
  return {
    current_odometer: "",
    interval_days: "",
    interval_km: "",
    is_active: true,
    last_service_date: "",
    last_service_odometer: "",
    maintenance_type: "preventive",
    notes: "",
    reference_no: "",
    status: "scheduled",
    title: "",
    vehicle_id: "",
  };
}

export function createInitialServiceRecordFormValues(): ServiceRecordFormValues {
  return {
    diagnosis: "",
    external_cost: "",
    is_active: true,
    labor_cost: "",
    mechanic_id: "",
    notes: "",
    odometer_reading: "",
    reference_no: "",
    schedule_id: "",
    service_date: new Date().toISOString().slice(0, 10),
    status: "open",
    title: "",
    vehicle_id: "",
    work_performed: "",
  };
}

export function createInitialPartUsedFormValues(): PartUsedFormValues {
  return {
    is_active: true,
    item_id: "",
    notes: "",
    quantity: "",
    service_record_id: "",
    unit_cost: "",
  };
}

export function buildMaintenanceSummaryMetrics(input: {
  mechanics: MechanicRecord[];
  schedules: MaintenanceScheduleRecord[];
  serviceRecords: ServiceRecordRecord[];
}): MaintenanceSummaryMetrics {
  return {
    activeMechanics: input.mechanics.filter((item) => item.is_active).length,
    completedServices: input.serviceRecords.filter((item) => item.status === "completed").length,
    dueSchedules: input.schedules.filter(
      (item) => item.status === "due" || item.due_state === "due"
    ).length,
    openServices: input.serviceRecords.filter(
      (item) => item.status === "open" || item.status === "in_progress"
    ).length,
    overdueSchedules: input.schedules.filter(
      (item) => item.status === "overdue" || item.due_state === "overdue"
    ).length,
    totalServiceCost: input.serviceRecords.reduce(
      (sum, item) => sum + Number(item.total_cost || 0),
      0
    ),
  };
}
