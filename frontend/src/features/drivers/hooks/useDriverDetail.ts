import { useEffect, useState } from "react";

import { useNotifications } from "@/core/contexts/useNotifications";
import { driversApi } from "@/features/drivers/services/drivers.api";
import type { DriverRecord } from "@/features/drivers/types/driver";

export function useDriverDetail(driverId?: number) {
  const { showToast } = useNotifications();
  const [driver, setDriver] = useState<DriverRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isFinite(driverId ?? NaN)) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError("");

    const loadDriver = async () => {
      try {
        const driverData = await driversApi.fetchDriver(driverId as number);
        if (!active) return;
        setDriver(driverData);
      } catch {
        if (active) {
          setError("We could not load the driver details.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadDriver();

    return () => {
      active = false;
    };
  }, [driverId]);

  async function refresh() {
    if (!driverId) return;

    setIsLoading(true);
    setError("");

    try {
      const driverData = await driversApi.fetchDriver(driverId);
      setDriver(driverData);
    } catch {
      setError("We could not refresh the driver details.");
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStatus(isActive: boolean) {
    if (!driver) return;

    try {
      const updatedDriver = await driversApi.updateDriver(driver.id, { is_active: isActive });
      setDriver(updatedDriver);
      showToast({
        title: isActive ? "Driver activated" : "Driver deactivated",
        message: `Driver status has been ${isActive ? "activated" : "deactivated"}.`,
        tone: "success",
      });
    } catch {
      showToast({
        title: "Unable to update driver",
        message: "We could not update the driver status.",
        tone: "danger",
      });
    }
  }

  return {
    driver,
    error,
    isLoading,
    refresh,
    updateStatus,
  } as const;
}
