export interface DashboardAlert {
  type: "info" | "success" | "warning" | "danger";
  title: string;
  count: number;
  url: string;
}

export interface DashboardSummaryPayload {
  total_inventory_items: number;
  low_stock_items: number;
  trips_today: number;
  trips_this_week: number;
  fuel_today_litres: number;
  fuel_this_month_litres: number;
  active_vehicles: number;
  overdue_maintenance: number;
  pending_requisitions: number;
  alerts: DashboardAlert[];
}

export type DashboardMetric = {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning" | "danger";
  details?: DashboardMetric[];
};

export type DashboardSummary = DashboardMetric[];
