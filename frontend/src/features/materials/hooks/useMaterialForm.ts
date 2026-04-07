import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useNotifications } from "@/core/contexts/useNotifications";
import { appRoutes } from "@/core/constants/routes";
import { materialsApi, createInitialMaterialFormValues } from "@/features/materials/services/materials.api";
import type { MaterialFormValues } from "@/features/materials/types/material";

function validateMaterialForm(values: MaterialFormValues) {
  const errors: Partial<Record<keyof MaterialFormValues, string>> = {};

  if (!values.name.trim()) {
    errors.name = "Material name is required.";
  }

  if (!values.code.trim()) {
    errors.code = "Material code is required.";
  }

  if (!values.category) {
    errors.category = "Material category is required.";
  }

  if (!values.unit_of_measure) {
    errors.unit_of_measure = "Material unit is required.";
  }

  if (values.density_factor.trim() && Number.isNaN(Number(values.density_factor))) {
    errors.density_factor = "Density factor must be a number.";
  }

  return errors;
}

function hasFormChanges(current: MaterialFormValues, initial: MaterialFormValues) {
  return JSON.stringify(current) !== JSON.stringify(initial);
}

export function useMaterialForm(materialId?: number) {
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const [formValues, setFormValues] = useState<MaterialFormValues>(createInitialMaterialFormValues);
  const [initialValues, setInitialValues] = useState<MaterialFormValues>(createInitialMaterialFormValues);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof MaterialFormValues, string>>>({});

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    const loadMaterial = async () => {
      try {
        if (materialId) {
          const material = await materialsApi.fetchMaterial(materialId);
          if (!active) return;

          const nextValues: MaterialFormValues = {
            name: material.name,
            code: material.code,
            category: material.category,
            unit_of_measure: material.unit_of_measure,
            description: material.description || "",
            density_factor: material.density_factor?.toString() || "",
            is_active: material.is_active,
          };

          setFormValues(nextValues);
          setInitialValues(nextValues);
        } else {
          const initial = createInitialMaterialFormValues();
          setFormValues(initial);
          setInitialValues(initial);
        }
      } catch {
        if (active) {
          setError("Unable to load material details.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadMaterial();

    return () => {
      active = false;
    };
  }, [materialId]);

  function setForm(form: MaterialFormValues) {
    setFormValues(form);
    if (Object.keys(fieldErrors).length > 0) {
      setFieldErrors({});
    }
  }

  function updateField<K extends keyof MaterialFormValues>(field: K, value: MaterialFormValues[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function confirmDiscardChanges() {
    if (!hasFormChanges(formValues, initialValues)) {
      return true;
    }

    return window.confirm("You have unsaved changes. Are you sure you want to leave?");
  }

  async function submit() {
    setIsSubmitting(true);
    setError("");
    setFieldErrors({});

    const validationErrors = validateMaterialForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("Please correct the highlighted fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (materialId) {
        await materialsApi.updateMaterial(materialId, formValues);
        showToast({ title: "Material updated", message: "Material details were updated.", tone: "success" });
      } else {
        await materialsApi.createMaterial(formValues);
        showToast({ title: "Material created", message: "New material has been added.", tone: "success" });
      }
      navigate(appRoutes.materials);
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: unknown } })?.response?.data;
      if (responseData && typeof responseData === "object") {
        const nextFieldErrors: Partial<Record<keyof MaterialFormValues, string>> = {};
        for (const [key, value] of Object.entries(responseData)) {
          if (key in formValues) {
            nextFieldErrors[key as keyof MaterialFormValues] = Array.isArray(value)
              ? String(value[0])
              : String(value);
          }
        }
        setFieldErrors(nextFieldErrors);
        setError("Please correct the errors below.");
      } else {
        setError(materialId ? "Unable to update material." : "Unable to create material.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    confirmDiscardChanges,
    error,
    fieldErrors,
    formValues,
    isLoading,
    isSubmitting,
    submit,
    setForm,
    updateField,
  } as const;
}
