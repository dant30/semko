import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { useNotifications } from "@/core/contexts/useNotifications";
import { materialsApi } from "@/features/materials/services/materials.api";
import { setMaterialsFilters } from "@/features/materials/store/materials.slice";
import type { MaterialRecord, MaterialFilters } from "@/features/materials/types/material";

export function useMaterialsWorkspace() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.materials.filters);
  const { showToast } = useNotifications();

  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    materialsApi
      .fetchMaterials(filters)
      .then((data) => {
        if (!active) return;
        setMaterials(data);
      })
      .catch(() => {
        if (active) setError("Unable to load materials at this time.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters]);

  const setFilters = (changes: Partial<MaterialFilters>) => {
    dispatch(setMaterialsFilters(changes));
  };

  const resetFilters = () => {
    dispatch(
      setMaterialsFilters({
        search: "",
        category: "",
        unitOfMeasure: "",
        activeOnly: true,
      })
    );
  };

  const refreshMaterials = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await materialsApi.fetchMaterials(filters);
      setMaterials(data);
    } catch {
      setError("Unable to refresh materials right now.");
      showToast({ message: "Unable to refresh materials", tone: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMaterial = async (materialId: number) => {
    setIsSubmitting(true);
    setError("");

    try {
      await materialsApi.deleteMaterial(materialId);
      showToast({ message: "Material removed", tone: "success" });
      await refreshMaterials();
    } catch {
      showToast({ message: "Unable to delete material", tone: "danger" });
      setError("Delete failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const summary = useMemo(
    () => ({
      total: materials.length,
      active: materials.filter((item) => item.is_active).length,
      inactive: materials.filter((item) => !item.is_active).length,
    }),
    [materials]
  );

  return {
    materials,
    isLoading,
    isSubmitting,
    error,
    filters,
    summary,
    setFilters,
    resetFilters,
    refreshMaterials,
    deleteMaterial,
  } as const;
}
