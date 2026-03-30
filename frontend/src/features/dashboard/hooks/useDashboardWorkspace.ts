import { useCallback, useEffect, useRef, useState } from "react";

import { useNotifications } from "@/core/contexts/useNotifications";
import { useAppDispatch } from "@/core/store/hooks";
import { dashboardApi } from "@/features/dashboard/services/dashboard.api";
import { setMetrics } from "@/features/dashboard/store/dashboard.slice";
import type {
  DashboardAlert,
  DashboardSummaryPayload,
} from "@/features/dashboard/types/dashboard";

type DashboardMetric = {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger";
};

function buildDashboardMetrics(summary: DashboardSummaryPayload): DashboardMetric[] {
  return [
    {
      label: "Total inventory items",
      value: `${summary.total_inventory_items}`,
      tone: "default",
    },
    {
      label: "Low stock items",
      value: `${summary.low_stock_items}`,
      tone: summary.low_stock_items > 0 ? "warning" : "success",
    },
    {
      label: "Trips today",
      value: `${summary.trips_today}`,
      tone: summary.trips_today > 0 ? "success" : "default",
    },
    {
      label: "Trips this week",
      value: `${summary.trips_this_week}`,
      tone: summary.trips_this_week > 0 ? "default" : "warning",
    },
    {
      label: "Fuel today",
      value: `${summary.fuel_today_litres} L`,
      tone: summary.fuel_today_litres > 0 ? "default" : "warning",
    },
    {
      label: "Fuel this month",
      value: `${summary.fuel_this_month_litres} L`,
      tone: "default",
    },
    {
      label: "Active vehicles",
      value: `${summary.active_vehicles}`,
      tone: summary.active_vehicles > 0 ? "success" : "warning",
    },
    {
      label: "Overdue maintenance",
      value: `${summary.overdue_maintenance}`,
      tone: summary.overdue_maintenance > 0 ? "danger" : "success",
    },
    {
      label: "Pending requisitions",
      value: `${summary.pending_requisitions}`,
      tone: summary.pending_requisitions > 0 ? "warning" : "success",
    },
  ];
}

export function useDashboardWorkspace() {
  const dispatch = useAppDispatch();
  const { showToast } = useNotifications();
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [summary, setSummary] = useState<DashboardSummaryPayload | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const isMountedRef = useRef(false);

  const loadDashboard = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await dashboardApi.fetchSummary();

      if (!isMountedRef.current) {
        return;
      }

      setAlerts(response.alerts);
      setSummary(response);
      dispatch(setMetrics(buildDashboardMetrics(response)));
      setLastUpdated(new Date());
    } catch (cause) {
      if (!isMountedRef.current) {
        return;
      }

      const message =
        cause instanceof Error
          ? cause.message
          : "Unable to load dashboard data.";

      showToast({
        title: "Dashboard load failed",
        message,
        tone: "danger",
      });
      setError(message);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [dispatch, showToast]);

  useEffect(() => {
    isMountedRef.current = true;
    void loadDashboard();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadDashboard]);

  return {
    isLoading,
    error,
    alerts,
    summary,
    lastUpdated,
    refresh: loadDashboard,
  };
}
