import { apiClient } from "@/core/api/client";
import type { RoleRecord, UserFilters, UserFormValues, UserRecord } from "@/features/users/types/user";

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

export const usersApi = {
  async fetchUsers(filters: UserFilters) {
    const response = await apiClient.get("/users/", {
      params: {
        active_only: filters.activeOnly ? "true" : undefined,
        search: filters.search || undefined,
      },
    });

    return normalizeArrayResponse<UserRecord>(response.data);
  },

  async fetchRoles() {
    const response = await apiClient.get("/users/roles/");
    return normalizeArrayResponse<RoleRecord>(response.data);
  },

  async createUser(values: UserFormValues) {
    const response = await apiClient.post<UserRecord>("/users/", {
      username: values.username,
      email: values.email,
      first_name: values.first_name,
      last_name: values.last_name,
      phone_number: values.phone_number || null,
      role_id: values.role_id || null,
      is_active: values.is_active,
      is_staff: values.is_staff,
      must_change_password: values.must_change_password,
      password: values.password,
      password_confirm: values.password_confirm,
    });
    return response.data;
  },

  async updateUser(id: number, values: Partial<UserFormValues>) {
    const response = await apiClient.patch<UserRecord>(`/users/${id}/`, {
      ...values,
      role_id: values.role_id ?? undefined,
    });
    return response.data;
  },

  async deactivateUser(id: number) {
    await apiClient.delete(`/users/${id}/`);
  },

  async fetchUser(id: number) {
    const response = await apiClient.get<UserRecord>(`/users/${id}/`);
    return response.data;
  },
};

export function createInitialUserFormValues(): UserFormValues {
  return {
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    role_id: "",
    password: "",
    password_confirm: "",
    is_active: true,
    is_staff: false,
    must_change_password: false,
  };
}

export function buildUserSummaryMetrics(users: UserRecord[]) {
  const activeUsers = users.filter((u) => u.is_active).length;
  const inactiveUsers = users.length - activeUsers;
  const staffUsers = users.filter((u) => u.is_staff).length;

  return {
    totalUsers: users.length,
    activeUsers,
    inactiveUsers,
    staffUsers,
  };
}
