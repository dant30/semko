import { apiClient } from "@/core/api/client";
import type {
  DriverFormValues,
  DriversFilters,
  DriverRecord,
  DriversSummaryMetrics,
} from "@/features/drivers/types/driver";

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

export const driversApi = {
  async fetchDrivers(
    filters: Pick<DriversFilters, "activeOnly" | "employmentStatus" | "licenseStatus" | "search">
  ) {
    const response = await apiClient.get("/drivers/", {
      params: {
        active_only: filters.activeOnly ? "true" : undefined,
        employment_status: filters.employmentStatus || undefined,
        license_status: filters.licenseStatus || undefined,
        search: filters.search || undefined,
      },
    });

    return normalizeArrayResponse<DriverRecord>(response.data);
  },

  async createDriver(values: DriverFormValues) {
    const response = await apiClient.post<DriverRecord>("/drivers/", values);
    return response.data;
  },
};

export function createInitialDriverFormValues(): DriverFormValues {
  return {
    address: "",
    alternate_phone_number: "",
    date_of_birth: "",
    email: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    employee_id: "",
    employment_status: "active",
    first_name: "",
    hire_date: "",
    is_active: true,
    last_name: "",
    national_id: "",
    notes: "",
    phone_number: "",
    license: {
      expiry_date: "",
      issue_date: "",
      issuing_authority: "",
      license_class: "",
      license_number: "",
      notes: "",
      restrictions: "",
      status: "valid",
    },
  };
}

export function buildDriversSummaryMetrics(drivers: DriverRecord[]): DriversSummaryMetrics {
  const today = new Date();
  const dueBoundary = new Date();
  dueBoundary.setDate(today.getDate() + 30);

  return {
    activeDrivers: drivers.filter((driver) => driver.is_active).length,
    expiringSoon: drivers.filter((driver) => {
      if (!driver.license?.expiry_date) {
        return false;
      }

      const expiry = new Date(driver.license.expiry_date);
      return expiry >= today && expiry <= dueBoundary;
    }).length,
    onLeaveDrivers: drivers.filter((driver) => driver.employment_status === "on_leave").length,
    suspendedDrivers: drivers.filter((driver) =>
      ["suspended", "revoked"].includes(driver.license?.status || "") ||
      driver.employment_status === "suspended"
    ).length,
    validLicenses: drivers.filter((driver) => driver.license?.status === "valid").length,
    withExpiredLicenses: drivers.filter(
      (driver) => driver.license?.status === "expired" || driver.license?.is_expired
    ).length,
  };
}
