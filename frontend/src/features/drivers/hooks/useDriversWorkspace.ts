import { useEffect, useState } from "react";

import { useNotifications } from "@/core/contexts/useNotifications";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import {
  buildDriversSummaryMetrics,
  createInitialDriverFormValues,
  driversApi,
} from "@/features/drivers/services/drivers.api";
import {
  resetDriversFilters,
  setDriversFilters,
  setDriversView,
} from "@/features/drivers/store/drivers.slice";
import type {
  DriverFormValues,
  DriverRecord,
  DriversSummaryMetrics,
  DriverView,
} from "@/features/drivers/types/driver";

const EMPTY_SUMMARY: DriversSummaryMetrics = {
  activeDrivers: 0,
  expiringSoon: 0,
  onLeaveDrivers: 0,
  suspendedDrivers: 0,
  validLicenses: 0,
  withExpiredLicenses: 0,
};

export function useDriversWorkspace() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.drivers);
  const { showToast } = useNotifications();

  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [summary, setSummary] = useState<DriversSummaryMetrics>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [driverForm, setDriverForm] = useState<DriverFormValues>(createInitialDriverFormValues);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    driversApi
      .fetchDrivers(filters)
      .then((driversData) => {
        if (!active) return;
        setDrivers(driversData);
        setSummary(buildDriversSummaryMetrics(driversData));
      })
      .catch(() => {
        if (active) {
          setError("We could not load the drivers workspace right now.");
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

  async function refreshAll() {
    setIsLoading(true);
    try {
      const driversData = await driversApi.fetchDrivers(filters);
      setDrivers(driversData);
      setSummary(buildDriversSummaryMetrics(driversData));
    } catch {
      setError("We could not refresh the drivers workspace right now.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitDriver() {
    setIsSubmitting(true);
    setError("");

    try {
      await driversApi.createDriver(driverForm);
      setDriverForm(createInitialDriverFormValues());
      await refreshAll();
      showToast({
        message: "Driver and license record created successfully.",
        title: "Drivers updated",
        tone: "success",
      });
    } catch {
      const message =
        "We could not save the driver workflow. Please review the driver and license details and try again.";
      setError(message);
      showToast({
        message,
        title: "Driver save failed",
        tone: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    driverForm,
    drivers,
    error,
    filters,
    isLoading,
    isSubmitting,
    refreshAll,
    setDriverForm,
    setFilters: (payload: Partial<typeof filters>) => dispatch(setDriversFilters(payload)),
    resetFilters: () => dispatch(resetDriversFilters()),
    setView: (view: DriverView) => dispatch(setDriversView(view)),
    submitDriver,
    summary,
  };
}
