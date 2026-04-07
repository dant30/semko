import { useEffect, useState } from "react";

import { materialsApi } from "@/features/materials/services/materials.api";
import type { MaterialRecord } from "@/features/materials/types/material";

export function useMaterialDetail(materialId?: number) {
  const [material, setMaterial] = useState<MaterialRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setMaterial(null);
    setError("");

    if (!materialId) {
      return () => {
        active = false;
      };
    }

    setIsLoading(true);

    materialsApi
      .fetchMaterial(materialId)
      .then((data) => {
        if (!active) return;
        setMaterial(data);
      })
      .catch(() => {
        if (active) {
          setError("Unable to load material details.");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [materialId]);

  return {
    material,
    isLoading,
    error,
  } as const;
}
