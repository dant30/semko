import { apiClient } from "@/core/api/client";
import type {
  MaterialFilters,
  MaterialFormValues,
  MaterialRecord,
} from "@/features/materials/types/material";

function normalizeMaterialArray(payload: unknown): MaterialRecord[] {
  if (Array.isArray(payload)) {
    return payload as MaterialRecord[];
  }

  if (payload && typeof payload === "object" && "results" in payload) {
    return (payload as { results?: unknown[] }).results as MaterialRecord[];
  }

  return [];
}

export const materialsApi = {
  async fetchMaterials(filters: MaterialFilters) {
    const response = await apiClient.get("/materials/", {
      params: {
        search: filters.search || undefined,
        category: filters.category || undefined,
        unit_of_measure: filters.unitOfMeasure || undefined,
        active_only: filters.activeOnly ? "true" : undefined,
      },
    });

    return normalizeMaterialArray(response.data);
  },

  async fetchMaterial(id: number) {
    const response = await apiClient.get<MaterialRecord>(`/materials/${id}/`);
    return response.data;
  },

  async createMaterial(data: MaterialFormValues) {
    const payload = {
      ...data,
      density_factor: data.density_factor || undefined,
    };
    const response = await apiClient.post<MaterialRecord>("/materials/", payload);
    return response.data;
  },

  async updateMaterial(id: number, data: MaterialFormValues) {
    const payload = {
      ...data,
      density_factor: data.density_factor || undefined,
    };
    const response = await apiClient.put<MaterialRecord>(`/materials/${id}/`, payload);
    return response.data;
  },

  async deleteMaterial(id: number) {
    const response = await apiClient.delete<{ success: boolean }>(`/materials/${id}/`);
    return response.data;
  },
};

export function createInitialMaterialFormValues(): MaterialFormValues {
  return {
    name: "",
    code: "",
    category: "other",
    unit_of_measure: "tonne",
    description: "",
    density_factor: "",
    is_active: true,
  };
}
