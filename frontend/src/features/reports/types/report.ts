export interface ReportRecord {
  id: number;
  title: string;
}

export interface PayrollPeriodRecord {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface PayrollPeriodSummaryPayload {
  payroll_period: string;
  status: string;
  driver_count: number;
  delivered_trip_count: number;
  verified_trip_count: number;
  gross_trip_revenue: string;
  gross_bonus_earnings: string;
  gross_non_trip_earnings: string;
  gross_policy_earnings: string;
  trip_deduction_total: string;
  policy_deduction_total: string;
  statutory_deduction_total: string;
  total_deductions: string;
  net_trip_pay: string;
  total_cess_reference: string;
  total_hired_owner_settlement: string;
}
