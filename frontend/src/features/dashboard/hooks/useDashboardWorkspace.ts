import { useCallback, useEffect, useRef, useState } from "react";

import { useNotifications } from "@/core/contexts/useNotifications";
import { useAppDispatch } from "@/core/store/hooks";
import { dashboardApi } from "@/features/dashboard/services/dashboard.api";
import { setMetrics } from "@/features/dashboard/store/dashboard.slice";
import type {
  DashboardAlert,
  DashboardMetric,
  DashboardMetricTrend,
  DashboardSummaryPayload,
} from "@/features/dashboard/types/dashboard";

function formatTrend(current: number, previous: number, compareTo: string): DashboardMetricTrend {
  const currentValue = Number(current) || 0;
  const previousValue = Number(previous) || 0;

  if (currentValue === previousValue) {
    return {
      direction: "flat",
      label: `0% vs ${compareTo}`,
    };
  }

  const difference = currentValue - previousValue;
  const percentChange = previousValue === 0 ? 100 : Math.round((difference / previousValue) * 100);
  const direction = difference > 0 ? "up" : "down";
  const sign = difference > 0 ? "+" : "";

  return {
    direction,
    label: `${direction === "up" ? "▲" : "▼"} ${sign}${percentChange}% vs ${compareTo}`,
  };
}

function buildDashboardMetrics(summary: DashboardSummaryPayload): DashboardMetric[] {
  return [
    {
      label: "Inventory",
      value: `${summary.total_inventory_items}`,
      tone: summary.low_stock_items > 0 ? "warning" : "success",
      trend: formatTrend(summary.total_inventory_items, summary.previous_total_inventory_items, "yesterday"),
      details: [
        {
          label: "Low stock items",
          value: `${summary.low_stock_items}`,
          tone: summary.low_stock_items > 0 ? "warning" : "success",
          trend: formatTrend(summary.low_stock_items, summary.previous_low_stock_items, "yesterday"),
        },
      ],
    },
    {
      label: "Trips",
      value: `${summary.trips_today}`,
      tone: summary.trips_today > 0 ? "success" : "default",
      trend: formatTrend(summary.trips_today, summary.previous_trips_today, "yesterday"),
      details: [
        {
          label: "This week",
          value: `${summary.trips_this_week}`,
          tone: summary.trips_this_week > 0 ? "default" : "warning",
          trend: formatTrend(summary.trips_this_week, summary.previous_trips_this_week, "last week"),
        },
      ],
    },
    {
      label: "Fuel",
      value: `${summary.fuel_today_litres} L`,
      tone: summary.fuel_today_litres > 0 ? "default" : "warning",
      trend: formatTrend(summary.fuel_today_litres, summary.previous_fuel_today_litres, "yesterday"),
      details: [
        {
          label: "This month",
          value: `${summary.fuel_this_month_litres} L`,
          tone: "default",
          trend: formatTrend(summary.fuel_this_month_litres, summary.previous_fuel_this_month_litres, "last month"),
        },
      ],
    },
    {
      label: "Vehicles",
      value: `${summary.active_vehicles}`,
      tone: summary.active_vehicles > 0 ? "success" : "warning",
      trend: formatTrend(summary.active_vehicles, summary.previous_active_vehicles, "yesterday"),
      details: [
        {
          label: "Overdue maintenance",
          value: `${summary.overdue_maintenance}`,
          tone: summary.overdue_maintenance > 0 ? "danger" : "success",
          trend: formatTrend(summary.overdue_maintenance, summary.previous_overdue_maintenance, "yesterday"),
        },
      ],
    },
    {
      label: "Pending requisitions",
      value: `${summary.pending_requisitions}`,
      tone: summary.pending_requisitions > 0 ? "warning" : "success",
      trend: formatTrend(summary.pending_requisitions, summary.previous_pending_requisitions, "yesterday"),
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
