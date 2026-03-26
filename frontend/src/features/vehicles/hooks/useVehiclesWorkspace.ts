import { useEffect, useMemo, useState } from "react";

import { useNotifications } from "@/core/contexts/useNotifications";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import {
  buildVehicleSummaryMetrics,
  createInitialVehicleFormValues,
  createInitialVehicleOwnershipFormValues,
  createInitialVehicleTypeFormValues,
  vehiclesApi,
} from "@/features/vehicles/services/vehicles.api";
import {
  setVehiclesFilters,
  setVehiclesView,
} from "@/features/vehicles/store/vehicles.slice";
import type {
  VehicleFormValues,
  VehicleOwnershipFormValues,
  VehicleOwnershipRecord,
  VehicleRecord,
  VehicleSummaryMetrics,
  VehicleTypeFormValues,
  VehicleTypeRecord,
  VehicleView,
} from "@/features/vehicles/types/vehicle";

const EMPTY_SUMMARY: VehicleSummaryMetrics = {
  activeVehicles: 0,
  insuranceDueSoon: 0,
  internalOwnerships: 0,
  maintenanceVehicles: 0,
  ownershipRecords: 0,
  vehicleTypes: 0,
};

export function useVehiclesWorkspace() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.vehicles);
  const { showToast } = useNotifications();

  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [types, setTypes] = useState<VehicleTypeRecord[]>([]);
  const [ownerships, setOwnerships] = useState<VehicleOwnershipRecord[]>([]);
  const [summary, setSummary] = useState<VehicleSummaryMetrics>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingView, setSubmittingView] = useState<VehicleView | null>(null);

  const [vehicleForm, setVehicleForm] = useState<VehicleFormValues>(createInitialVehicleFormValues);
  const [typeForm, setTypeForm] = useState<VehicleTypeFormValues>(createInitialVehicleTypeFormValues);
  const [ownershipForm, setOwnershipForm] = useState<VehicleOwnershipFormValues>(
    createInitialVehicleOwnershipFormValues
  );

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    Promise.all([
      vehiclesApi.fetchVehicles(filters),
      vehiclesApi.fetchTypes(),
      vehiclesApi.fetchOwnerships(filters.ownershipType),
    ])
      .then(([vehiclesData, typesData, ownershipsData]) => {
        if (!active) {
          return;
        }

        setVehicles(vehiclesData);
        setTypes(typesData);
        setOwnerships(ownershipsData);
        setSummary(
          buildVehicleSummaryMetrics({
            ownerships: ownershipsData,
            types: typesData,
            vehicles: vehiclesData,
          })
        );
      })
      .catch(() => {
        if (active) {
          setError("We could not load the vehicles workspace right now.");
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
  }, [filters]);

  const lookupOptions = useMemo(
    () => ({
      ownerships: ownerships.map((item) => ({
        id: item.id,
        label: item.name,
        subtitle: item.ownership_type,
      })),
      types: types.map((item) => ({
        id: item.id,
        label: item.name,
        subtitle: `${item.code} - ${item.default_capacity_tonnes}t`,
      })),
    }),
    [ownerships, types]
  );

  async function refreshAll() {
    setIsLoading(true);
    try {
      const [vehiclesData, typesData, ownershipsData] = await Promise.all([
        vehiclesApi.fetchVehicles(filters),
        vehiclesApi.fetchTypes(),
        vehiclesApi.fetchOwnerships(filters.ownershipType),
      ]);

      setVehicles(vehiclesData);
      setTypes(typesData);
      setOwnerships(ownershipsData);
      setSummary(
        buildVehicleSummaryMetrics({
          ownerships: ownershipsData,
          types: typesData,
          vehicles: vehiclesData,
        })
      );
    } catch {
      setError("We could not refresh the vehicles workspace right now.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitForView(view: VehicleView) {
    setSubmittingView(view);
    setError("");

    try {
      switch (view) {
        case "fleet":
          await vehiclesApi.createVehicle(vehicleForm);
          setVehicleForm(createInitialVehicleFormValues());
          break;
        case "types":
          await vehiclesApi.createType(typeForm);
          setTypeForm(createInitialVehicleTypeFormValues());
          break;
        case "ownerships":
          await vehiclesApi.createOwnership(ownershipForm);
          setOwnershipForm(createInitialVehicleOwnershipFormValues());
          break;
      }

      await refreshAll();
      showToast({
        message: `${view.charAt(0).toUpperCase()}${view.slice(1)} workflow updated successfully.`,
        title: "Vehicles updated",
        tone: "success",
      });
    } catch {
      const message =
        "We could not save the vehicle workflow. Please review the form and try again.";
      setError(message);
      showToast({
        message,
        title: "Vehicle save failed",
        tone: "danger",
      });
    } finally {
      setSubmittingView(null);
    }
  }

  return {
    error,
    filters,
    isLoading,
    lookupOptions,
    ownershipForm,
    ownerships,
    refreshAll,
    setFilters: (payload: Partial<typeof filters>) => dispatch(setVehiclesFilters(payload)),
    setOwnershipForm,
    setTypeForm,
    setVehicleForm,
    setView: (view: VehicleView) => dispatch(setVehiclesView(view)),
    submittingView,
    submitForView,
    summary,
    typeForm,
    types,
    vehicleForm,
    vehicles,
  };
}
