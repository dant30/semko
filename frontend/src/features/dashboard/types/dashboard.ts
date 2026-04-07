// frontend/src/features/dashboard/types/dashboard.ts
export interface DashboardAlert {
  type: "info" | "success" | "warning" | "danger";
  title: string;
  count: number;
  url: string;
}

export interface DashboardSummaryPayload {
  total_inventory_items: number;
  previous_total_inventory_items: number;
  low_stock_items: number;
  previous_low_stock_items: number;
  trips_today: number;
  previous_trips_today: number;
  trips_this_week: number;
  previous_trips_this_week: number;
  fuel_today_litres: number;
  previous_fuel_today_litres: number;
  fuel_this_month_litres: number;
  previous_fuel_this_month_litres: number;
  active_vehicles: number;
  previous_active_vehicles: number;
  overdue_maintenance: number;
  previous_overdue_maintenance: number;
  pending_requisitions: number;
  previous_pending_requisitions: number;
  alerts: DashboardAlert[];
}

export type DashboardMetricTrend = {
  direction: "up" | "down" | "flat";
  label: string;
};

export type DashboardMetric = {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning" | "danger";
  trend?: DashboardMetricTrend;
  details?: DashboardMetric[];
};

export type DashboardSummary = DashboardMetric[];
