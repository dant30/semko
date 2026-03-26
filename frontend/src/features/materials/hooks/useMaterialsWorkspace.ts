import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { useNotifications } from "@/core/contexts/useNotifications";
import { materialsApi } from "@/features/materials/services/materials.api";
import { setMaterialsFilters, setSelectedMaterialId } from "@/features/materials/store/materials.slice";
import type {
  MaterialFormValues,
  MaterialRecord,
  MaterialFilters,
} from "@/features/materials/types/material";

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

export function useMaterialsWorkspace() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.materials.filters);
  const selectedMaterialId = useAppSelector((state) => state.materials.selectedMaterialId);
  const { showToast } = useNotifications();

  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialRecord | null>(null);
  const [materialForm, setMaterialForm] = useState<MaterialFormValues>(createInitialMaterialFormValues);
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

  const selectedMaterialDetails = useMemo(() => {
    return materials.find((item) => item.id === selectedMaterialId) || null;
  }, [materials, selectedMaterialId]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const setSelected = (materialId: number | null) => {
    dispatch(setSelectedMaterialId(materialId));
    if (materialId == null) {
      setSelectedMaterial(null);
      setMaterialForm(createInitialMaterialFormValues());
      return;
    }

    const existing = materials.find((item) => item.id === materialId);
    if (existing) {
      setSelectedMaterial(existing);
      setMaterialForm({
        name: existing.name,
        code: existing.code,
        category: existing.category,
        unit_of_measure: existing.unit_of_measure,
        description: existing.description || "",
        density_factor: existing.density_factor?.toString() || "",
        is_active: existing.is_active,
      });
    }
  };

  const submitMaterial = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    try {
      if (selectedMaterialId) {
        await materialsApi.updateMaterial(selectedMaterialId, materialForm);
        showToast({ message: "Material updated", tone: "success" });
      } else {
        await materialsApi.createMaterial(materialForm);
        showToast({ message: "Material created", tone: "success" });
      }
      await refreshMaterials();
      setSelected(null);
    } catch {
      showToast({ message: "Unable to save material", tone: "danger" });
      setError("Save failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteMaterial = async (materialId: number) => {
    setIsSubmitting(true);
    setError("");

    try {
      await materialsApi.deleteMaterial(materialId);
      showToast({ message: "Material removed", tone: "success" });
      await refreshMaterials();
      if (selectedMaterialId === materialId) {
        setSelected(null);
      }
    } catch {
      showToast({ message: "Unable to delete material", tone: "danger" });
      setError("Delete failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const summary = {
    total: materials.length,
    active: materials.filter((item) => item.is_active).length,
    inactive: materials.filter((item) => !item.is_active).length,
  };

  return {
    materials,
    selectedMaterial,
    selectedMaterialDetails,
    materialForm,
    isLoading,
    isSubmitting,
    error,
    filters,
    summary,

    setFilters,
    resetFilters,
    refreshMaterials,
    setSelected,
    setMaterialForm,
    submitMaterial,
    deleteMaterial,
  };
}
