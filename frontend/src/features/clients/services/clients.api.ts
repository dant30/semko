import { apiClient } from "@/core/api/client";
import type {
  ClientFilters,
  ClientFormValues,
  ClientRecord,
} from "@/features/clients/types/client";

export function createInitialClientFormValues(): ClientFormValues {
  return {
    name: "",
    code: "",
    client_type: "corporate",
    contact_person: "",
    phone_number: "",
    alternate_phone_number: "",
    email: "",
    address: "",
    town: "",
    county: "",
    status: "active",
    notes: "",
    is_active: true,
  };
}

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

export const clientsApi = {
  async fetchClients(filters: ClientFilters) {
    const response = await apiClient.get("/clients/", {
      params: {
        search: filters.search || undefined,
        client_type: filters.clientType || undefined,
        status: filters.status || undefined,
        active_only: filters.activeOnly ? "true" : undefined,
      },
    });

    return normalizeArrayResponse<ClientRecord>(response.data);
  },

  async fetchClient(id: number) {
    const response = await apiClient.get<ClientRecord>(`/clients/${id}/`);
    return response.data;
  },

  async createClient(values: ClientFormValues) {
    const response = await apiClient.post<ClientRecord>("/clients/", values);
    return response.data;
  },

  async updateClient(id: number, values: Partial<ClientFormValues>) {
    const response = await apiClient.patch<ClientRecord>(`/clients/${id}/`, values);
    return response.data;
  },

  async deactivateClient(id: number) {
    await apiClient.delete(`/clients/${id}/`);
  },
};
