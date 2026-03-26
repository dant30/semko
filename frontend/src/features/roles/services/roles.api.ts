import { apiClient } from "@/core/api/client";
import type { RoleFormValues, RoleRecord } from "@/features/roles/types/role";

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

export const rolesApi = {
  async fetchRoles(search?: string) {
    const response = await apiClient.get("/users/roles/", {
      params: {
        search: search || undefined,
      },
    });
    return normalizeArrayResponse<RoleRecord>(response.data);
  },

  async createRole(values: RoleFormValues) {
    const response = await apiClient.post<RoleRecord>("/users/roles/", {
      ...values,
      permissions: values.permissions
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
    return response.data;
  },

  async updateRole(id: number, values: Partial<RoleFormValues>) {
    const payload = {
      ...values,
      permissions: values.permissions
        ? values.permissions.split(",").map((item) => item.trim()).filter(Boolean)
        : undefined,
    };
    const response = await apiClient.patch<RoleRecord>(`/users/roles/${id}/`, payload);
    return response.data;
  },

  async deleteRole(id: number) {
    await apiClient.delete(`/users/roles/${id}/`);
  },
};

export function createInitialRoleFormValues(): RoleFormValues {
  return {
    name: "",
    code: "",
    description: "",
    permissions: "",
  };
}
